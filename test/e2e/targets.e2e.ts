import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import {
    CodeTarget,
    generateCode,
    parse,
    GeneratorError,
    RequestOptions,
} from "../../src";
import { toRequest } from "../../src/request";
import { chromeJsonPost, firefoxFormPost } from "../fixtures/browser";
import { OTHER_RUNNERS, RUNNERS } from "./runners";
import { EchoServer } from "./server";

const tricky = "it's \"quoted\" \\ back\nline $HOME `cmd` #{x} ${x} \\(x) %s café ✓ 😀";
const trickyHeader = 'it\'s "quoted" \\ back $HOME `cmd` #{x} ${x} \\(x) %s';

// Headers a browser sets itself; the JavaScript target leaves them out.
const BROWSER_CONTROLLED =
    /^(accept-charset|accept-encoding|connection|content-length|cookie|date|dnt|expect|host|keep-alive|origin|referer|te|trailer|transfer-encoding|upgrade|via|proxy-.*|sec-.*)$/i;

interface Case {
    name: string;
    build: (base: string) => RequestOptions;
    output?: RegExp;
    redirected?: boolean;
    /** Targets that report the response as an error (Axios on a 3xx). */
    mayFail?: CodeTarget[];
    /** Targets that must refuse the request with UNSUPPORTED_TARGET. */
    unsupported?: CodeTarget[];
}

const fromCurl = (command: string, base: string) =>
    parse.curlCommand(command.replace(/https:\/\/[a-z.]+\.com/, base));

const CASES: Case[] = [
    {
        name: "existing query plus added query",
        build: (base) => ({
            url: `${base}/q?existing=a%20b&existing=2&flag`,
            query: { tags: ["a b", "c&d"], q: "x=y/?#", empty: "" },
        }),
    },
    {
        name: "array params",
        build: (base) => ({
            url: `${base}/p`,
            query: { tags: ["a b", "c&d"], plus: "1+1", u: "https://example.com/?a=b&c=d" },
        }),
    },
    {
        name: "scalar params",
        build: (base) => ({ url: `${base}/p`, query: { a: "1", b: "x y", c: "é" } }),
    },
    {
        name: "JSON POST",
        build: (base) => ({
            url: `${base}/json`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: tricky,
                nested: { list: [1, 2.5, true, false, null], empty: {}, none: [] },
            }),
        }),
    },
    { name: "Chrome JSON POST", build: (base) => fromCurl(chromeJsonPost, base) },
    { name: "Firefox form POST", build: (base) => fromCurl(firefoxFormPost, base) },
    {
        name: "PUT text with shell and quote characters",
        build: (base) => ({
            url: `${base}/text-put`,
            method: "PUT",
            headers: { "Content-Type": "text/plain; charset=utf-8", "X-Tricky": trickyHeader },
            body: `${tricky}\n\ttrailing newline\n`,
        }),
    },
    {
        name: "non-ASCII header",
        build: (base) => ({ url: `${base}/unicode`, headers: { "X-Name": "café ✓ 😀", "X-Latin": "café" } }),
        unsupported: [CodeTarget.JavaScript, CodeTarget.NodeFetch, CodeTarget.NodeAxios],
    },
    {
        name: "PATCH with an empty body",
        build: (base) => ({
            url: `${base}/empty-patch`,
            method: "PATCH",
            headers: { "Content-Type": "text/plain" },
            body: "",
        }),
    },
    { name: "DELETE", build: (base) => ({ url: `${base}/items/1`, method: "DELETE" }) },
    { name: "HEAD", build: (base) => ({ url: `${base}/head`, method: "HEAD" }) },
    { name: "custom method", build: (base) => ({ url: `${base}/cache`, method: "PURGE" }) },
    {
        name: "Basic auth, cookies and an empty header",
        build: (base) =>
            parse.curlCommand(`curl -u 'us:p@ss' -b 'a=1' -b 'b=2' -H 'X-Empty;' -A 'agent/1.0' '${base}/auth'`),
    },
    {
        name: "Bearer auth",
        build: (base) => parse.curlCommand(`curl --oauth2-bearer 'tok.en' '${base}/bearer'`),
    },
    {
        name: "follow redirects",
        build: (base) => ({ url: `${base}/redirect`, followRedirects: true }),
        redirected: true,
    },
    {
        name: "do not follow redirects",
        build: (base) => ({ url: `${base}/redirect`, followRedirects: false }),
        redirected: false,
        mayFail: [CodeTarget.NodeAxios],
    },
    {
        name: "compressed response",
        build: (base) => ({ url: `${base}/gzip`, compressed: true }),
        output: /^decoded gzip body/m,
    },
    {
        name: "plain text response",
        build: (base) => ({ url: `${base}/text` }),
        output: /^plain text response/m,
    },
    { name: "empty response", build: (base) => ({ url: `${base}/empty` }), output: /^\s*$/ },
];

const server = new EchoServer();
let port = 0;

beforeAll(async () => {
    port = await server.start();
});

afterAll(() => server.stop());

describe.each([...RUNNERS, ...OTHER_RUNNERS])("$target", (runner) => {
    test.each(CASES)("$name", async (testCase) => {
        const base = `http://${runner.host}:${port}`;
        const request = testCase.build(base);
        if (testCase.unsupported?.includes(runner.target)) {
            expect(() => generateCode(request, runner.target)).toThrow(/non-ASCII/);
            return;
        }
        let code: string;
        try {
            code = generateCode(request, runner.target);
        } catch (error) {
            if (
                runner.skipUnsupported &&
                error instanceof GeneratorError &&
                error.code === "UNSUPPORTED_TARGET"
            ) {
                return;
            }
            throw error;
        }

        server.reset();
        let output = "";
        try {
            output = await runner.run(code);
        } catch (error) {
            if (!testCase.mayFail?.includes(runner.target)) {
                throw new Error(`${(error as Error).message}\n\n${code}`);
            }
        }

        const expected = toRequest(request);
        const [first] = server.requests;
        expect(first).toBeDefined();

        const method =
            runner.target === CodeTarget.PythonRequests
                ? expected.method.toUpperCase()
                : expected.method;
        expect(first.method).toBe(method);

        const sent = new URL(first.url, base);
        const wanted = new URL(expected.fullUrl);
        expect(sent.pathname).toBe(wanted.pathname);
        expect([...sent.searchParams]).toEqual([...wanted.searchParams]);
        if (runner.target === CodeTarget.Curl) {
            expect(first.url).toBe(wanted.pathname + wanted.search);
        }

        for (const [name, value] of expected.headers) {
            if (runner.target === CodeTarget.JavaScript && BROWSER_CONTROLLED.test(name)) {
                continue;
            }
            const received = first.headers.filter(
                ([key]) => key.toLowerCase() === name.toLowerCase()
            );
            expect({ name, values: received.map(([, v]) => v) }).toEqual({
                name,
                values: [value],
            });
        }

        expect(first.body).toBe(expected.body ?? "");

        if (testCase.redirected !== undefined) {
            expect(server.requests.some((r) => r.url === "/final")).toBe(testCase.redirected);
        }
        if (testCase.output && runner.printsResponse !== false) {
            expect(output).toMatch(testCase.output);
        }
    });
});
