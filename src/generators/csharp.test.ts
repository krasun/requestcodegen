import { describe, expect, test } from "@jest/globals";
import { generateCSharpCode } from "./csharp";    

describe('generateCSharpCode', () => {
    test('should generate correct code with GET method and no headers, body or query', () => {
        const options = {
            method: 'GET',
            url: 'https://example.com'
        };
        const result = generateCSharpCode(options);
        expect(result).toContain('Method = new HttpMethod("GET")');
        expect(result).toContain('RequestUri = new Uri("https://example.com")');
    });

    test('should generate correct code with POST method and headers', () => {
        const options = {
            method: 'POST',
            url: 'https://example.com',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const result = generateCSharpCode(options);
        expect(result).toContain('Method = new HttpMethod("POST")');
        expect(result).toContain('request.Headers.Add("Content-Type", "application/json");');
    });

    test('should generate correct code with body', () => {
        const options = {
            method: 'POST',
            url: 'https://example.com',
            body: '{"key":"value"}'
        };
        const result = generateCSharpCode(options);
        expect(result).toContain('request.Content = new StringContent("{\"key\":\"value\"}");');
    });

    test('should generate correct code with query parameters', () => {
        const options = {
            method: 'GET',
            url: 'https://example.com',
            query: {
                'key': 'value'
            }
        };
        const result = generateCSharpCode(options);
        expect(result).toContain('query["key"] = "value";');
    });

    test('should generate correct code with array query parameters', () => {
        const options = {
            method: 'GET',
            url: 'https://example.com',
            query: {
                'key': ['value1', 'value2']
            }
        };
        const result = generateCSharpCode(options);
        expect(result).toContain('query["key"] = "value1";');
        expect(result).toContain('query["key"] = "value2";');
    });
});