import { describe, expect, test } from "@jest/globals";
import { parse, ParseError } from "../src";
import { chromeGet, chromeJsonPost, firefoxFormPost } from "./fixtures/browser";

function expectError(fn: () => unknown, code: string, message?: RegExp) {
    try {
        fn();
    } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        expect((error as ParseError).code).toBe(code);
        if (message) {
            expect((error as Error).message).toMatch(message);
        }
        return error as ParseError;
    }
    throw new Error("Expected an error");
}

describe("parse.curlCommand: methods", () => {
    test("defaults to GET and adds http:// like curl", () => {
        expect(parse.curlCommand("curl example.com")).toEqual({
            url: "http://example.com",
            method: "GET",
        });
    });

    test("accepts curl.exe and a leading prompt", () => {
        expect(parse.curlCommand("$ curl.exe https://example.com").url).toBe(
            "https://example.com"
        );
    });

    test("infers POST from data", () => {
        expect(parse.curlCommand("curl https://x.test -d a=1")).toEqual({
            url: "https://x.test",
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "a=1",
        });
    });

    test("uses HEAD for -I", () => {
        expect(parse.curlCommand("curl -I https://x.test").method).toBe("HEAD");
    });

    test.each(["PUT", "PATCH", "DELETE", "PURGE"])("keeps -X %s", (method) => {
        expect(parse.curlCommand(`curl -X ${method} https://x.test`).method).toBe(method);
        expect(parse.curlCommand(`curl --request=${method} https://x.test`).method).toBe(
            method
        );
        expect(parse.curlCommand(`curl -X${method} https://x.test`).method).toBe(method);
    });

    test("-X overrides inferred POST", () => {
        const request = parse.curlCommand("curl -X PUT https://x.test -d a=1");
        expect(request.method).toBe("PUT");
        expect(request.body).toBe("a=1");
    });

    test("rejects -I with data", () => {
        expectError(() => parse.curlCommand("curl -I https://x.test -d a"), "INVALID_INPUT");
    });

    test("rejects an invalid method", () => {
        expectError(() => parse.curlCommand("curl -X 'BAD METHOD' https://x.test"), "INVALID_INPUT");
    });
});

describe("parse.curlCommand: data", () => {
    test("joins repeated data with &", () => {
        expect(parse.curlCommand("curl https://x.test -d a=1 --data b=2 --data-binary c=3").body).toBe(
            "a=1&b=2&c=3"
        );
    });

    test("encodes --data-urlencode like curl", () => {
        const request = parse.curlCommand(
            `curl https://x.test --data-urlencode 'x=a b&c' --data-urlencode '=é~*' --data-urlencode plain`
        );
        expect(request.body).toBe("x=a+b%26c&%C3%A9~%2A&plain");
    });

    test("--json sets JSON headers and concatenates without a separator", () => {
        expect(parse.curlCommand(`curl https://x.test --json '{"a":1}' --json '{"b":2}'`)).toEqual({
            url: "https://x.test",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: '{"a":1}{"b":2}',
        });
    });

    test("--json does not validate or reformat JSON", () => {
        expect(parse.curlCommand(`curl https://x.test --json '{ "a" : 1, }'`).body).toBe(
            '{ "a" : 1, }'
        );
    });

    test("explicit headers win over --json defaults", () => {
        const request = parse.curlCommand(
            `curl https://x.test --json '{}' -H 'Content-Type: application/vnd.api+json' -H 'Accept: text/html'`
        );
        expect(request.headers).toEqual({
            "Content-Type": "application/vnd.api+json",
            Accept: "text/html",
        });
    });

    test("keeps an empty body", () => {
        const request = parse.curlCommand("curl https://x.test -d ''");
        expect(request.body).toBe("");
        expect(request.method).toBe("POST");
    });

    test("keeps a leading @ in --data-raw", () => {
        expect(parse.curlCommand("curl https://x.test --data-raw '@handle'").body).toBe("@handle");
    });

    test("-G appends data to the query", () => {
        expect(parse.curlCommand("curl 'https://x.test/a?x=1' -G -d a=1 --data-urlencode 'q=a b'")).toEqual({
            url: "https://x.test/a?x=1&a=1&q=a+b",
            method: "GET",
        });
    });

    test("-G with -X keeps the method", () => {
        const request = parse.curlCommand("curl https://x.test -G -d a=1 -X POST");
        expect(request.method).toBe("POST");
        expect(request.url).toBe("https://x.test?a=1");
        expect(request.body).toBeUndefined();
    });

    test("keeps multi-line data", () => {
        expect(parse.curlCommand("curl https://x.test --data-binary $'x\\ny'").body).toBe("x\ny");
    });
});

describe("parse.curlCommand: headers and auth", () => {
    test("parses headers, empty headers and repeated headers", () => {
        const request = parse.curlCommand(
            `curl https://x.test -H 'X-A: 1' -H 'x-a: 2' -H 'X-Empty;' -H 'Cookie: a=1' -H 'cookie: b=2'`
        );
        expect(request.headers).toEqual({ "X-A": "1, 2", "X-Empty": "", Cookie: "a=1; b=2" });
    });

    test("builds Basic auth", () => {
        expect(parse.curlCommand("curl -u 'us:p@ss' https://x.test").headers).toEqual({
            Authorization: "Basic dXM6cEBzcw==",
        });
        expect(parse.curlCommand("curl --basic --user 'us:p' https://x.test").headers).toEqual({
            Authorization: "Basic dXM6cA==",
        });
    });

    test("moves URL credentials to Basic auth", () => {
        expect(parse.curlCommand("curl https://us:p%40ss@x.test/a")).toEqual({
            url: "https://x.test/a",
            method: "GET",
            headers: { Authorization: "Basic dXM6cEBzcw==" },
        });
    });

    test("builds Bearer auth", () => {
        expect(parse.curlCommand("curl --oauth2-bearer tok https://x.test").headers).toEqual({
            Authorization: "Bearer tok",
        });
    });

    test("explicit headers win over -u, -A and -b like curl", () => {
        const request = parse.curlCommand(
            "curl -u a:b -A ua -b a=1 https://x.test -H 'Authorization: Bearer t' -H 'User-Agent: hdr' -H 'Cookie: c=3'"
        );
        expect(request.headers).toEqual({
            Authorization: "Bearer t",
            "User-Agent": "hdr",
            Cookie: "c=3",
        });
    });

    test("joins cookies and maps -A and -e", () => {
        expect(parse.curlCommand("curl -b a=1 -b 'b=2' -A 'my agent' -e 'https://r.test;auto' https://x.test").headers).toEqual({
            "User-Agent": "my agent",
            Referer: "https://r.test",
            Cookie: "a=1; b=2",
        });
    });

    test("rejects a password prompt", () => {
        expectError(() => parse.curlCommand("curl -u user https://x.test"), "UNSUPPORTED_INPUT", /password/);
    });

    test("rejects header removal", () => {
        expectError(() => parse.curlCommand("curl -H 'Accept:' https://x.test"), "UNSUPPORTED_INPUT");
    });

    test("rejects invalid header names", () => {
        expectError(() => parse.curlCommand("curl -H 'Bad Name: x' https://x.test"), "INVALID_INPUT");
    });

    test("errors do not echo credentials or bodies", () => {
        const error = expectError(
            () => parse.curlCommand("curl -u 'secret-user' https://x.test -d 'secret-body'"),
            "UNSUPPORTED_INPUT"
        );
        expect(error.message).not.toContain("secret");
    });
});

describe("parse.curlCommand: flags", () => {
    test("maps -L, --no-location and --compressed", () => {
        expect(parse.curlCommand("curl -L --compressed https://x.test")).toMatchObject({
            followRedirects: true,
            compressed: true,
        });
        expect(parse.curlCommand("curl --no-location https://x.test").followRedirects).toBe(false);
        const plain = parse.curlCommand("curl https://x.test --compressed --no-compressed");
        expect(plain.followRedirects).toBeUndefined();
        expect(plain.compressed).toBeUndefined();
    });

    test("accepts combined short options and output-only flags", () => {
        expect(
            parse.curlCommand("curl -sSLiv -o out.json -w '%{http_code}' -m 10 --retry 2 -f https://x.test")
        ).toEqual({ url: "https://x.test", method: "GET", followRedirects: true });
    });

    test("accepts options after the URL and --", () => {
        expect(parse.curlCommand("curl -s -- https://x.test").url).toBe("https://x.test");
        expect(parse.curlCommand("curl https://x.test -X DELETE").method).toBe("DELETE");
    });

    test.each([
        ["curl -F a=1 https://x.test", /form/],
        ["curl -T file.txt https://x.test", /upload/],
        ["curl -K config.txt https://x.test", /Config/],
        ["curl -k https://x.test", /TLS/],
        ["curl --digest -u a:b https://x.test", /--digest/],
        ["curl https://x.test --next https://y.test", /--next/],
    ])("rejects %s", (command, message) => {
        expectError(() => parse.curlCommand(command), "UNSUPPORTED_INPUT", message);
    });

    test.each([
        "curl -d @body.json https://x.test",
        "curl --data-binary @- https://x.test",
        "curl --json @body.json https://x.test",
        "curl --data-urlencode name@file.txt https://x.test",
        "curl -H @headers.txt https://x.test",
        "curl -b cookies.txt https://x.test",
    ])("rejects file references: %s", (command) => {
        expectError(() => parse.curlCommand(command), "UNSUPPORTED_INPUT", /file/);
    });

    test("rejects multiple URLs and non-HTTP URLs", () => {
        expectError(() => parse.curlCommand("curl https://x.test https://y.test"), "UNSUPPORTED_INPUT");
        expectError(() => parse.curlCommand("curl ftp://x.test/file"), "UNSUPPORTED_INPUT");
        expectError(() => parse.curlCommand("curl -s"), "INVALID_INPUT");
    });

    test("rejects active globbing unless -g is used", () => {
        expectError(() => parse.curlCommand("curl 'https://x.test/[1-5]'"), "UNSUPPORTED_INPUT", /glob/);
        expectError(() => parse.curlCommand("curl 'https://x.test/{a,b}'"), "UNSUPPORTED_INPUT", /glob/);
        expect(parse.curlCommand("curl -g 'https://x.test/[1-5]'").url).toBe("https://x.test/[1-5]");
        expect(parse.curlCommand("curl 'https://x.test/?filter[name]=a'").url).toBe(
            "https://x.test/?filter[name]=a"
        );
    });

    test("drops the URL fragment, which curl never sends", () => {
        expect(parse.curlCommand("curl 'https://x.test/a?b=1#frag'").url).toBe("https://x.test/a?b=1");
    });
});

describe("parse.curlCommand: shell syntax", () => {
    test("handles quotes, escapes, concatenation and continuations", () => {
        const request = parse.curlCommand(`curl "https://x.test/"'path'\\
  -H "X-A: \\"q\\" \\$HOME" \\
  -H X-B:\\ unquoted \\
  -H $'X-C: tab\\tline' -d "it's"`);
        expect(request.url).toBe("https://x.test/path");
        expect(request.headers).toEqual({
            "X-A": '"q" $HOME',
            "X-B": "unquoted",
            "X-C": "tab\tline",
            "Content-Type": "application/x-www-form-urlencoded",
        });
        expect(request.body).toBe("it's");
    });

    test("keeps $VARIABLES and Unicode as literal text", () => {
        const request = parse.curlCommand(`curl https://x.test -H "Authorization: Bearer $API_TOKEN" -d 'naïve ✓'`);
        expect(request.headers?.Authorization).toBe("Bearer $API_TOKEN");
        expect(request.body).toBe("naïve ✓");
    });

    test("decodes UTF-8 byte escapes in $'...'", () => {
        expect(parse.curlCommand("curl https://x.test -d $'caf\\xc3\\xa9 \\u2713'").body).toBe("café ✓");
    });

    test("supports Windows line endings", () => {
        expect(parse.curlCommand("curl https://x.test \\\r\n  -X PUT\r\n").method).toBe("PUT");
    });

    test.each([
        "curl https://x.test | jq .",
        "curl https://x.test > out.json",
        "curl https://x.test; rm -rf /",
        "curl https://x.test && echo ok",
        "curl https://x.test?a=1&b=2",
        "curl $(cat url.txt)",
        "curl `cat url.txt`",
        'curl "https://x.test/$(whoami)"',
        "curl https://x.test/{a,b}",
        "curl https://x.test\ncurl https://y.test",
    ])("rejects %s", (command) => {
        expectError(() => parse.curlCommand(command), "UNSUPPORTED_INPUT");
    });

    test("rejects unterminated quotes and non-curl commands", () => {
        expectError(() => parse.curlCommand("curl 'https://x.test"), "INVALID_INPUT");
        expectError(() => parse.curlCommand("wget https://x.test"), "INVALID_INPUT");
        expectError(() => parse.curlCommand(""), "INVALID_INPUT");
    });
});

describe("parse.curlCommand: browser fixtures", () => {
    test("Chrome JSON POST", () => {
        const request = parse.curlCommand(chromeJsonPost);
        expect(request.method).toBe("POST");
        expect(request.url).toBe("https://api.example.com/graphql?op=Viewer");
        expect(request.body).toBe(
            '{"query":"query { viewer { login } }","variables":{"note":"it\'s café — ok","path":"C:\\\\tmp"}}'
        );
        expect(JSON.parse(request.body as string).variables.path).toBe("C:\\tmp");
        expect(request.headers?.Cookie).toBe("logged_in=yes; _octo=GH1.1.1234; tz=Europe%2FKyiv");
        expect(request.headers?.["sec-ch-ua"]).toBe('"Chromium";v="129", "Not=A?Brand";v="8"');
        expect(request.headers?.["content-type"]).toBe("application/json");
        expect(request.headers?.["Content-Type"]).toBeUndefined();
    });

    test("Chrome GET", () => {
        const request = parse.curlCommand(chromeGet);
        expect(request.method).toBe("GET");
        expect(request.url).toBe("https://www.example.com/search?q=caf%C3%A9&page=2");
        expect(request.headers?.Cookie).toBe("session=abc123");
    });

    test("Firefox form POST", () => {
        const request = parse.curlCommand(firefoxFormPost);
        expect(request).toMatchObject({
            method: "POST",
            compressed: true,
            body: "email=jane%40example.com&note=%C3%A9t%C3%A9",
        });
        expect(request.headers?.["Content-Type"]).toBe(
            "application/x-www-form-urlencoded; charset=UTF-8"
        );
        expect(request.headers?.Connection).toBe("keep-alive");
    });
});

test("parsed requests are plain JSON", () => {
    const request = parse.curlCommand(chromeJsonPost);
    expect(JSON.parse(JSON.stringify(request))).toEqual(request);
    expect(Object.getPrototypeOf(request)).toBe(Object.prototype);
});
