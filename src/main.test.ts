import { describe, expect, test } from "@jest/globals";
import { generateCode } from "./main";

describe("generateCode", () => {
    test("should generate Go HTTP client code with default method when no method is specified", async () => {
        const requestOptions = {
            url: "http://example.com",
        };
        const result = await generateCode(requestOptions, "go");
        expect(result).toContain('http.NewRequest("GET", "http://example.com", nil)');
    });

    test("should handle custom methods and headers", async () => {
        const requestOptions = {
            url: "http://example.com",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: '{"key":"value"}',
        };
        const result = await generateCode(requestOptions, "go");
        expect(result).toContain(
            'http.NewRequest("POST", "http://example.com",'
        );
        expect(result).toContain('"Content-Type", "application/json"');
    });
});
