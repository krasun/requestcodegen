import { describe, expect, test } from "@jest/globals";
import { generatePHPRequestsCode } from "./php-requests";
import { JsonBody } from "../request";

describe("generatePHPRequestsCode", () => {
    test("should generate correct PHP code with GET method", () => {
        const options = {
            method: "GET",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'GET';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(`$headers = [
    'Content-Type' => 'application/json'
]`);
        expect(result).toContain(`$query = [
    'key' => 'value'
]`);
        expect(result).toContain(`$body = [];`);
    });

    test("should generate correct PHP code with POST method and string body", () => {
        const options = {
            method: "POST",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: JSON.stringify({ data: "test" }),
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'POST';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(`$headers = [
    'Content-Type' => 'application/json'
]`);
        expect(result).toContain(`$query = [
    'key' => 'value'
]`);
        expect(result).toContain(`$body = [
    'data' => 'test'
]`);
    });

    test("should generate correct PHP code with POST method and JsonBody", () => {
        const options = {
            method: "POST",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: new JsonBody({ data: "test", nested: { key: "value" } }),
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'POST';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(`$headers = [
    'Content-Type' => 'application/json'
]`);
        expect(result).toContain(`$query = [
    'key' => 'value'
]`);
        expect(result).toContain(`$body = [
    'data' => 'test',
    'nested' => {"key":"value"}
]`);
    });

    test("should generate correct PHP code with non-JSON string body", () => {
        const options = {
            method: "POST",
            url: "https://example.com",
            headers: { "Content-Type": "text/plain" },
            body: "Hello, world!",
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'POST';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(`$headers = [
    'Content-Type' => 'text/plain'
]`);
        expect(result).toContain(`$body = 'Hello, world!';`);
    });

    test("should handle empty objects properly", () => {
        const options = {
            method: "GET",
            url: "https://example.com",
            headers: {},
            query: {},
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$headers = [];`);
        expect(result).toContain(`$query = [];`);
        expect(result).toContain(`$body = [];`);
    });
});
