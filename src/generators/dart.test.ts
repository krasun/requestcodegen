import { describe, expect, test } from "@jest/globals";
import { generateDartCode } from "./dart";
import { JsonBody } from "../request";

describe("generateDartCode", () => {
    test("should generate code with GET method and no headers", () => {
        const options = {
            url: "https://example.com",
            method: "GET",
        };
        const result = generateDartCode(options);
        expect(result).toContain("final response = await http.get(");
        expect(result).toContain("url");
    });

    test("should generate code with POST method and headers", () => {
        const options = {
            url: "https://example.com",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const result = generateDartCode(options);
        expect(result).toContain("final response = await http.post(");
        expect(result).toContain('"Content-Type": "application/json"');
    });

    test("should generate code with PUT method, headers and JSON body", () => {
        const options = {
            url: "https://example.com",
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: new JsonBody({
                key: "value",
                nested: {
                    data: "test"
                }
            }),
        };
        const result = generateDartCode(options);
        expect(result).toContain("final response = await http.put(");
        expect(result).toContain('"Content-Type": "application/json"');
        expect(result).toContain("final options = {");
        expect(result).toContain('"key": "value"');
        expect(result).toContain("body: jsonEncode(options)");
    });

    test("should generate code with query parameters", () => {
        const options = {
            url: "https://example.com",
            method: "GET",
            query: {
                key: "value",
                filter: "active"
            },
        };
        const result = generateDartCode(options);
        expect(result).toContain("final queryParameters = {");
        expect(result).toContain('"key": "value"');
        expect(result).toContain('"filter": "active"');
        expect(result).toContain("final urlWithQuery = url.replace(queryParameters: queryParameters)");
    });

    test("should handle non-200 status code with proper error message", () => {
        const options = {
            url: "https://example.com",
            method: "GET",
        };
        const result = generateDartCode(options);
        expect(result).toContain("throw Exception('Request failed with status: ${response.statusCode}')");
    });

    test("should handle raw string body", () => {
        const options = {
            url: "https://example.com",
            method: "POST",
            body: "raw string data",
        };
        const result = generateDartCode(options);
        expect(result).toContain("body: 'raw string data'");
    });
});
