import { describe, expect, test } from "@jest/globals";
import { generateElixirCode } from "./elixir";

describe("generateElixirCode", () => {
    test("should return correct code for GET request with query params", () => {
        const options = {
            method: "GET",
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value", array: ["item1", "item2"] },
        };
        const result = generateElixirCode(options);
        expect(result).toContain("use HTTPoison.Base");
        expect(result).toContain("get!(url, headers, params: params)");
        expect(result).toContain('"key": "value"');
        expect(result).toContain('"array": ["item1","item2"]');
    });

    test("should return correct code for POST request with JSON body", () => {
        const options = {
            method: "POST",
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                key: "value",
                nested: {
                    array: [1, 2, 3]
                }
            }),
        };
        const result = generateElixirCode(options);
        expect(result).toContain("post!(url, body, headers, params: params)");
        expect(result).toContain('{"key":"value","nested":{"array":[1,2,3]}}');
    });

    test("should handle empty headers and query params", () => {
        const options = {
            method: "GET",
            url: "http://example.com"
        };
        const result = generateElixirCode(options);
        expect(result).toContain("headers = %{}");
        expect(result).toContain("params = %{}");
        expect(result).toContain("body = nil");
    });

    test("should handle string body", () => {
        const options = {
            method: "POST",
            url: "http://example.com",
            body: "plain text body"
        };
        const result = generateElixirCode(options);
        expect(result).toContain('body = "plain text body"');
    });

    test("should support all HTTP methods", () => {
        const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
        methods.forEach(method => {
            const options = {
                method,
                url: "http://example.com"
            };
            const result = generateElixirCode(options);
            expect(result).not.toContain('case :${method.toLowerCase()} do');
            expect(result).toContain(`${method.toLowerCase()}!(url,`);
        });
    });

    test("should return error for invalid method", () => {
        const options = {
            method: "INVALID",
            url: "http://example.com"
        };
        const result = generateElixirCode(options);
        expect(result).toContain('response = HTTPoison.invalid!(url, headers, params: params)');
    });
});
