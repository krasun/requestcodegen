import { describe, expect, test } from "@jest/globals";
import { CodeTarget, generateCode, parse, ParseError } from "../src";

function errorCode(fn: () => unknown): string {
    try {
        fn();
    } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        return (error as ParseError).code;
    }
    throw new Error("Expected an error");
}

describe("parse.httpRequest", () => {
    test("resolves an origin-form target against the base URL", () => {
        expect(
            parse.httpRequest(
                "GET /v1/items?limit=10 HTTP/1.1\r\nHost: api.example.com\r\nAccept: application/json\r\n\r\n",
                "https://api.example.com/ignored/path"
            )
        ).toEqual({
            url: "https://api.example.com/v1/items?limit=10",
            method: "GET",
            headers: { Accept: "application/json" },
        });
    });

    test("uses https://<Host> when no base URL is given", () => {
        expect(parse.httpRequest("GET /a HTTP/1.1\nHost: example.com:8443\n\n").url).toBe(
            "https://example.com:8443/a"
        );
    });

    test("requires a base URL without Host", () => {
        expect(errorCode(() => parse.httpRequest("GET /a HTTP/1.1\r\n\r\n"))).toBe(
            "BASE_URL_REQUIRED"
        );
    });

    test("accepts an absolute target without a base URL", () => {
        expect(parse.httpRequest("DELETE http://example.com/a?b=1 HTTP/1.0\n\n")).toEqual({
            url: "http://example.com/a?b=1",
            method: "DELETE",
        });
    });

    test("does not let // change the host", () => {
        expect(
            parse.httpRequest("GET //evil.test/a HTTP/1.1\n\n", "https://example.com").url
        ).toBe("https://example.com//evil.test/a");
    });

    test("rejects a Host that disagrees with the URL", () => {
        expect(
            errorCode(() =>
                parse.httpRequest("GET /a HTTP/1.1\nHost: other.test\n\n", "https://example.com")
            )
        ).toBe("INVALID_INPUT");
        expect(
            parse.httpRequest("GET /a HTTP/1.1\nHost: example.com:443\n\n", "https://example.com")
                .url
        ).toBe("https://example.com/a");
    });

    test("preserves the body exactly, including trailing newlines", () => {
        const request = parse.httpRequest(
            'POST /items HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\n\r\n{"a":1}\r\n\r\n'
        );
        expect(request.body).toBe('{"a":1}\r\n\r\n');
        expect(request.headers).toEqual({ "Content-Type": "application/json" });
    });

    test("omits a missing body but keeps an explicitly empty one", () => {
        expect(parse.httpRequest("POST /a HTTP/1.1\nHost: x.test\n\n").body).toBeUndefined();
        expect(parse.httpRequest("POST /a HTTP/1.1\nHost: x.test").body).toBeUndefined();
        expect(
            parse.httpRequest("POST /a HTTP/1.1\nHost: x.test\nContent-Length: 0\n\n").body
        ).toBe("");
    });

    test("drops Host and Content-Length, which clients compute", () => {
        expect(
            parse.httpRequest("PUT /a HTTP/1.1\nHost: x.test\nContent-Length: 999\nX-A: 1\n\nhello")
        ).toEqual({
            url: "https://x.test/a",
            method: "PUT",
            headers: { "X-A": "1" },
            body: "hello",
        });
    });

    test("merges repeated headers", () => {
        expect(
            parse.httpRequest("GET /a HTTP/1.1\nHost: x.test\nAccept: a\naccept: b\nCookie: a=1\nCookie: b=2\n\n")
                .headers
        ).toEqual({ Accept: "a, b", Cookie: "a=1; b=2" });
    });

    test.each([
        ["POST /a HTTP/1.1\nHost: x.test\nTransfer-Encoding: chunked\n\n5\r\nhello\r\n0\r\n\r\n", "UNSUPPORTED_INPUT"],
        ["GET /a HTTP/1.1\nHost: x.test\nX-A: 1\n  continued\n\n", "UNSUPPORTED_INPUT"],
        ["GET /a HTTP/1.1\n:authority: x.test\n\n", "UNSUPPORTED_INPUT"],
        ["CONNECT x.test:443 HTTP/1.1\n\n", "UNSUPPORTED_INPUT"],
        ["OPTIONS * HTTP/1.1\nHost: x.test\n\n", "UNSUPPORTED_INPUT"],
        ["POST /a HTTP/1.1\nHost: x.test\n\nbin\x00ary", "UNSUPPORTED_INPUT"],
        ["GET /a HTTP/1.1 extra\n\n", "INVALID_INPUT"],
        ["not a request", "INVALID_INPUT"],
        ["GET /a HTTP/1.1\nBad Header: x\n\n", "INVALID_INPUT"],
        ["GET /a HTTP/1.1\nNo colon\n\n", "INVALID_INPUT"],
        ["GET /a HTTP/1.1\nHost: x.test\nContent-Length: abc\n\n", "INVALID_INPUT"],
        ["GET relative HTTP/1.1\nHost: x.test\n\n", "INVALID_INPUT"],
    ])("rejects %j", (input, code) => {
        expect(errorCode(() => parse.httpRequest(input))).toBe(code);
    });

    test("generates curl from raw HTTP", () => {
        expect(
            generateCode(
                parse.httpRequest("GET /items HTTP/1.1\r\nHost: example.com\r\n\r\n", "https://example.com"),
                CodeTarget.Curl
            )
        ).toBe("curl 'https://example.com/items'");
    });
});
