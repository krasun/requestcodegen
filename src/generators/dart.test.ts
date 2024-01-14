import { describe, expect, test } from "@jest/globals";
import { generateDartCode } from "./dart";    

describe('generateDartCode', () => {
    test('should generate code with GET method and no headers', () => {
        const options = {
            url: 'https://example.com',
            method: 'GET'
        };
        const result = generateDartCode(options);
        expect(result).toContain("var response = await http.get(url);");
    });

    test('should generate code with POST method and headers', () => {
        const options = {
            url: 'https://example.com',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const result = generateDartCode(options);
        expect(result).toContain("var response = await http.post(url, headers: {\"Content-Type\":\"application/json\"}");
    });

    test('should generate code with PUT method, headers and body', () => {
        const options = {
            url: 'https://example.com',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: '{"key":"value"}'
        };
        const result = generateDartCode(options);
        expect(result).toContain("var response = await http.put(url, headers: {\"Content-Type\":\"application/json\"}, body: '{\"key\":\"value\"}');");
    });

    test('should generate code with query parameters', () => {
        const options = {
            url: 'https://example.com',
            method: 'GET',
            query: {
                'key': 'value'
            }
        };
        const result = generateDartCode(options);
        expect(result).toContain("var queryParameters = {\"key\":\"value\"};");
    });

    test('should throw exception for non-200 status code', () => {
        const options = {
            url: 'https://example.com',
            method: 'GET'
        };
        const result = generateDartCode(options);
        expect(result).toContain("throw Exception('Failed to load data');");
    });
});