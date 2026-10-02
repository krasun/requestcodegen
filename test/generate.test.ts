import { describe, expect, test } from "@jest/globals";
import {
    CodeTarget,
    generateCode,
    parse,
    GeneratorError,
    ParseError,
    RequestOptions,
} from "../src";
import { chromeJsonPost, firefoxFormPost } from "./fixtures/browser";

const ALL_TARGETS = Object.values(CodeTarget);
const REQUIRED_TARGETS = [
    CodeTarget.Curl,
    CodeTarget.PythonRequests,
    CodeTarget.JavaScript,
    CodeTarget.NodeFetch,
    CodeTarget.NodeAxios,
    CodeTarget.PHPCurl,
    CodeTarget.PHPGuzzle,
];

function errorOf(fn: () => unknown): GeneratorError {
    try {
        fn();
    } catch (error) {
        expect(error).toBeInstanceOf(GeneratorError);
        return error as GeneratorError;
    }
    throw new Error("Expected an error");
}

function deepFreeze<T>(value: T): T {
    if (value && typeof value === "object") {
        Object.values(value).forEach(deepFreeze);
        Object.freeze(value);
    }
    return value;
}

const tricky = "it's \"quoted\" \\ back\nline $HOME `cmd` #{x} \\(x) ${x} café ✓ \t tab";
// Header values cannot contain line breaks, and fetch/Axios only send ASCII.
const trickyHeader = 'it\'s "quoted" \\ $HOME `cmd` #{x} \\(x) ${x} \t tab';

const complexRequest = (): RequestOptions => ({
    url: "https://example.com/api/items",
    method: "POST",
    query: { tags: ["a b", "c&d"], empty: "", list: [], q: "x=y" },
    headers: {
        "X-Tricky": trickyHeader,
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: tricky,
        nested: { list: [1, 2.5, true, false, null], empty: {}, none: [] },
    }),
});

describe("compatibility", () => {
    test("generateCode({ url }, CodeTarget.Curl) still works", () => {
        expect(generateCode({ url: "https://example.com" }, CodeTarget.Curl)).toBe(
            "curl 'https://example.com'"
        );
    });

    test("PHP keeps the stream implementation and PHPCurl is new", () => {
        expect(CodeTarget.PHP).toBe("PHP");
        expect(CodeTarget.PHPCurl).toBe("PHP (cURL)");
        expect(generateCode({ url: "https://x.test" }, CodeTarget.PHP)).toContain(
            "stream_context_create"
        );
        expect(generateCode({ url: "https://x.test" }, CodeTarget.PHPCurl)).toContain(
            "curl_exec"
        );
    });

    test.each(ALL_TARGETS)("%s generates the dashboard request", (target) => {
        const code = generateCode(
            {
                method: "GET",
                url: "https://api.screenshotone.com/take",
                query: {
                    access_key: "KEY",
                    url: "https://example.com/?a=b&c=d",
                    block_selectors: [".ad", "#cookie banner"],
                },
            },
            target
        );
        expect(code).toContain("access_key");
        expect(code).toContain("block_selectors");
    });

    test.each(ALL_TARGETS)("%s generates a JSON POST with complex data", (target) => {
        expect(generateCode(complexRequest(), target).length).toBeGreaterThan(0);
    });

});

describe("purity", () => {
    test.each(ALL_TARGETS)("%s does not mutate deep-frozen input", (target) => {
        const request = deepFreeze(complexRequest());
        const first = generateCode(request, target);
        expect(generateCode(request, target)).toBe(first);
    });

    test("output does not depend on generation order", () => {
        const forward = ALL_TARGETS.map((target) => generateCode(complexRequest(), target));
        const backward = [...ALL_TARGETS]
            .reverse()
            .map((target) => generateCode(complexRequest(), target))
            .reverse();
        expect(backward).toEqual(forward);
    });

    test("the request object is untouched", () => {
        const request = { url: "https://x.test", method: "POST", body: '{"a":[1]}' };
        generateCode(request, CodeTarget.PythonRequests);
        expect(request).toEqual({ url: "https://x.test", method: "POST", body: '{"a":[1]}' });
        expect("headers" in request).toBe(false);
    });
});

describe("validation", () => {
    test.each([
        [{ url: "/relative" }, "url"],
        [{ url: "ftp://x.test" }, "url"],
        [{ url: "" }, "url"],
        [{ url: "https://x.test", method: "BAD METHOD" }, "method"],
        [{ url: "https://x.test", headers: { "X-A": 1 } }, "headers"],
        [{ url: "https://x.test", headers: { "X-A": "a\r\nInjected: 1" } }, "headers"],
        [{ url: "https://x.test", headers: { "Bad Name": "x" } }, "headers"],
        [{ url: "https://x.test", headers: { "X-A": "1", "x-a": "2" } }, "headers"],
        [{ url: "https://x.test", query: { a: 1 } }, "query"],
        [{ url: "https://x.test", body: { a: 1 } }, "body"],
        [{ url: "https://x.test", followRedirects: "yes" }, "followRedirects"],
    ])("rejects %j", (request, field) => {
        const error = errorOf(() => generateCode(request as any, CodeTarget.Curl));
        expect(error.code).toBe("INVALID_REQUEST");
        expect(error.field).toBe(field);
    });

    test("rejects unknown targets", () => {
        expect(errorOf(() => generateCode({ url: "https://x.test" }, "COBOL" as CodeTarget)).code).toBe(
            "UNSUPPORTED_TARGET"
        );
    });

    test("does not echo header values in errors", () => {
        const error = errorOf(() =>
            generateCode({ url: "https://x.test", headers: { Authorization: "secret\n" } }, CodeTarget.Curl)
        );
        expect(error.message).not.toContain("secret");
    });
});

describe("URLs and queries", () => {
    const curlUrl = (request: RequestOptions) =>
        parse.curlCommand(generateCode(request, CodeTarget.Curl)).url;

    test("appends query entries once, repeats arrays and drops empty arrays", () => {
        expect(
            curlUrl({
                url: "https://x.test/p",
                query: { a: "1", b: ["2", "3"], c: [], d: "" },
            })
        ).toBe("https://x.test/p?a=1&b=2&b=3&d=");
    });

    test("keeps the existing query spelling and duplicates", () => {
        expect(
            curlUrl({ url: "https://x.test/p?x=%20&x=2&flag", query: { y: "a b" } })
        ).toBe("https://x.test/p?x=%20&x=2&flag&y=a+b");
    });

    test("encodes reserved characters", () => {
        expect(curlUrl({ url: "https://x.test", query: { "k&=": "v/?#&=+%" } })).toBe(
            "https://x.test?k%26%3D=v%2F%3F%23%26%3D%2B%25"
        );
    });

    test("excludes the fragment", () => {
        expect(curlUrl({ url: "https://x.test/p?a=1#frag", query: { b: "2" } })).toBe(
            "https://x.test/p?a=1&b=2"
        );
    });

    test("encodes spaces and non-ASCII characters in the URL", () => {
        expect(curlUrl({ url: "https://x.test/a b/é" })).toBe("https://x.test/a%20b/%C3%A9");
    });

    test("adds -g for brackets", () => {
        expect(generateCode({ url: "https://x.test/?f[a]=1" }, CodeTarget.Curl)).toBe(
            "curl -g 'https://x.test/?f[a]=1'"
        );
    });
});

describe("bodies", () => {
    const python = (body: string, contentType = "application/json") =>
        generateCode(
            { url: "https://x.test", method: "POST", headers: { "Content-Type": contentType }, body },
            CodeTarget.PythonRequests
        );

    test("Python sends the body unchanged with data=", () => {
        expect(python('{"a":1}')).toContain(`data = '{"a":1}'`);
        expect(python('{"a":1}')).not.toContain("json=");
    });

    test("Python sends non-Latin-1 text as UTF-8 bytes", () => {
        expect(python("café ✓", "text/plain")).toContain(`data = "café ✓".encode()`);
    });

    test("JavaScript shows exact JSON as an object and other text as a string", () => {
        const request = (body: string) => ({
            url: "https://x.test",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        });
        expect(generateCode(request('{"a":[1,"x"]}'), CodeTarget.NodeFetch)).toContain(
            "body: JSON.stringify({"
        );
        expect(generateCode(request('{ "a": 1 }'), CodeTarget.NodeFetch)).toContain(
            `body: "{ \\"a\\": 1 }"`
        );
        expect(generateCode(request("[1,2]"), CodeTarget.NodeAxios)).toContain("data: [");
        expect(generateCode(request("not json"), CodeTarget.NodeAxios)).toContain(
            "transformRequest: [(data) => data]"
        );
    });

    test("an empty body is different from no body", () => {
        expect(generateCode({ url: "https://x.test", method: "POST", body: "" }, CodeTarget.Curl)).toBe(
            "curl 'https://x.test' \\\n  -d ''"
        );
        expect(generateCode({ url: "https://x.test", method: "POST" }, CodeTarget.Curl)).toBe(
            "curl -X POST 'https://x.test'"
        );
    });
});

describe("target limitations", () => {
    test("browser fetch rejects GET/HEAD bodies and compressed: false", () => {
        for (const target of [CodeTarget.JavaScript, CodeTarget.NodeFetch]) {
            expect(
                errorOf(() => generateCode({ url: "https://x.test", body: "x" }, target)).code
            ).toBe("UNSUPPORTED_TARGET");
        }
        expect(
            errorOf(() => generateCode({ url: "https://x.test", compressed: false }, CodeTarget.JavaScript))
                .code
        ).toBe("UNSUPPORTED_TARGET");
        expect(generateCode({ url: "https://x.test", compressed: false }, CodeTarget.NodeFetch)).toContain(
            `"Accept-Encoding": "identity"`
        );
    });

    test("browser fetch leaves out headers the browser controls", () => {
        const code = generateCode(parse.curlCommand(firefoxFormPost), CodeTarget.JavaScript);
        for (const header of ["Cookie", "Origin", "Referer", "Sec-Fetch-Mode", "Accept-Encoding", "Connection"]) {
            expect(code).not.toContain(`"${header}"`);
        }
        expect(code).toContain(`"User-Agent"`);
        expect(code).toContain(`credentials: "include"`);
    });

    test("JavaScript clients reject non-ASCII header values; others send UTF-8", () => {
        const request = { url: "https://x.test", headers: { "X-Name": "café" } };
        for (const target of [CodeTarget.JavaScript, CodeTarget.NodeFetch, CodeTarget.NodeAxios]) {
            expect(errorOf(() => generateCode(request, target)).code).toBe("UNSUPPORTED_TARGET");
        }
        expect(generateCode(request, CodeTarget.PythonRequests)).toContain(`"café".encode()`);
        expect(generateCode(request, CodeTarget.Curl)).toContain("X-Name: café");
    });

    test("fetch rejects a Host header for another host", () => {
        expect(
            errorOf(() =>
                generateCode({ url: "https://x.test", headers: { Host: "other.test" } }, CodeTarget.NodeFetch)
            ).code
        ).toBe("UNSUPPORTED_TARGET");
    });

    test("Node fetch accepts Firefox's Connection header", () => {
        expect(generateCode(parse.curlCommand(firefoxFormPost), CodeTarget.NodeFetch)).toContain(
            `"Connection": "keep-alive"`
        );
    });

    test("redirect flags map to every required target", () => {
        const request = { url: "https://x.test", followRedirects: false };
        expect(generateCode(request, CodeTarget.JavaScript)).toContain(`redirect: "manual"`);
        expect(generateCode(request, CodeTarget.NodeAxios)).toContain("maxRedirects: 0");
        expect(generateCode(request, CodeTarget.PythonRequests)).toContain("allow_redirects=False");
        expect(generateCode(request, CodeTarget.PHPGuzzle)).toContain("'allow_redirects' => false");
        expect(generateCode(request, CodeTarget.Curl)).toBe("curl 'https://x.test'");
        expect(generateCode(request, CodeTarget.PHPCurl)).not.toContain("FOLLOWLOCATION");
        expect(generateCode({ url: "https://x.test", followRedirects: true }, CodeTarget.PHPCurl)).toContain(
            "CURLOPT_FOLLOWLOCATION => true"
        );
    });

    test("other targets reject flags their client cannot express", () => {
        expect(generateCode({ url: "https://x.test", followRedirects: true }, CodeTarget.Go)).toContain(
            "client.Do"
        );
        expect(
            errorOf(() => generateCode({ url: "https://x.test", followRedirects: true }, CodeTarget.Ruby)).code
        ).toBe("UNSUPPORTED_TARGET");
        expect(
            errorOf(() => generateCode({ url: "https://x.test", compressed: true }, CodeTarget.Java)).code
        ).toBe("UNSUPPORTED_TARGET");
    });

    test("Java rejects methods HttpURLConnection cannot send", () => {
        expect(
            errorOf(() => generateCode({ url: "https://x.test", method: "PATCH" }, CodeTarget.Java)).code
        ).toBe("UNSUPPORTED_TARGET");
    });
});

describe("curl round trip", () => {
    const corpus: RequestOptions[] = [
        { url: "https://x.test" },
        { url: "https://x.test", method: "HEAD" },
        { url: "https://x.test", method: "DELETE" },
        { url: "https://x.test", method: "PURGE" },
        { url: "https://x.test", method: "GET", body: "x", headers: { "Content-Type": "text/plain" } },
        { url: "https://x.test", method: "POST", headers: { "Content-Type": "text/plain" }, body: tricky },
        { url: "https://x.test", method: "PUT", headers: { "Content-Type": "text/plain" }, body: "" },
        { url: "https://x.test", method: "POST", headers: { "Content-Type": "text/plain" }, body: "@literal" },
        { url: "https://x.test/p?a=1", query: { b: ["2", "3"] }, headers: { "X-Empty": "", "X-T": trickyHeader } },
        { url: "https://x.test", followRedirects: true, compressed: true },
        parse.curlCommand(chromeJsonPost),
        parse.curlCommand(firefoxFormPost),
    ];

    test.each(corpus.map((request) => [JSON.stringify(request), request]))(
        "%s",
        (_, request) => {
            const once = parse.curlCommand(generateCode(request as RequestOptions, CodeTarget.Curl));
            const twice = parse.curlCommand(generateCode(once, CodeTarget.Curl));
            expect(twice).toEqual(once);
            expect(once.method).toBe((request as RequestOptions).method ?? "GET");
            expect(once.body).toBe((request as RequestOptions).body);
            for (const [name, value] of Object.entries((request as RequestOptions).headers ?? {})) {
                expect(once.headers?.[name]).toBe(value);
            }
            expect(once.followRedirects).toBe((request as RequestOptions).followRedirects);
            expect(once.compressed).toBe((request as RequestOptions).compressed);
        }
    );

    test("survives JSON.stringify/JSON.parse", () => {
        const request = parse.curlCommand(chromeJsonPost);
        const restored = JSON.parse(JSON.stringify(request, null, 2));
        expect(generateCode(restored, CodeTarget.Curl)).toBe(generateCode(request, CodeTarget.Curl));
    });
});

describe("required target output", () => {
    test.each(REQUIRED_TARGETS)("%s", (target) => {
        expect(generateCode(complexRequest(), target)).toMatchSnapshot();
        expect(generateCode(parse.curlCommand(chromeJsonPost), target)).toMatchSnapshot();
        expect(generateCode({ url: "https://example.com" }, target)).toMatchSnapshot();
    });
});

test("the public API exposes the parsers only through parse", () => {
    const api = require("../src");
    expect(Object.keys(api).sort()).toEqual(
        ["CodeTarget", "GeneratorError", "ParseError", "generateCode", "parse"].sort()
    );
    expect(Object.keys(parse).sort()).toEqual(["curlCommand", "httpRequest"]);
    expect(Object.isFrozen(parse)).toBe(true);
});

test("parsers throw ParseError and generateCode throws GeneratorError", () => {
    expect(() => parse.curlCommand("curl -H 'Bad Name: x' https://x.test")).toThrow(ParseError);
    expect(() => parse.httpRequest("GET /a HTTP/1.1\n\n")).toThrow(ParseError);
    expect(() => generateCode({ url: "/relative" }, CodeTarget.Curl)).toThrow(GeneratorError);
    expect(() => generateCode({ url: "https://x.test", body: "x" }, CodeTarget.NodeFetch)).toThrow(
        GeneratorError
    );
});
