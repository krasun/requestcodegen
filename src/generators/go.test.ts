import { describe, expect, test } from "@jest/globals";
import { generateGoCode } from "./go";    
import { JsonBody } from "../request";

describe('generateGoCode', () => {
    test('should generate correct code with GET method', () => {
        const options = {
            url: 'http://example.com',
            method: 'GET'
        };
        const result = generateGoCode(options);
        expect(result).toContain('method := "GET"');
        expect(result).toContain('url := "http://example.com"');
    });

    test('should generate correct code with POST method and body', () => {
        const options = {
            url: 'http://example.com',
            method: 'POST',
            body: '{"key":"value"}'
        };
        const result = generateGoCode(options);
        expect(result).toContain('method := "POST"');
        expect(result).toContain('jsonBody := `{"key":"value"}`');
    });

    test('should generate correct code with complex JSON body', () => {
        const options = {
            url: 'http://example.com',
            method: 'POST',
            body: new JsonBody({
                key1: 'value1',
                key2: {
                    nested: 'value2'
                },
                array: [1, 2, 3]
            })
        };
        const result = generateGoCode(options);
        expect(result).toContain('jsonBody := `{');
        expect(result).toContain('    "key1": "value1"');
        expect(result).toContain('    "key2": {');
        expect(result).toContain('        "nested": "value2"');
        expect(result).toContain('    }');
        expect(result).toContain('    "array": [');
        expect(result).toContain('        1,');
        expect(result).toContain('        2,');
        expect(result).toContain('        3');
        expect(result).toContain('    ]');
        expect(result).toContain('}`');
    });

    test('should generate correct code with headers', () => {
        const options = {
            url: 'http://example.com',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const result = generateGoCode(options);
        expect(result).toContain('req.Header.Add("Content-Type", "application/json")');
    });

    test('should generate correct code with query parameters', () => {
        const options = {
            url: 'http://example.com',
            method: 'GET',
            query: {
                'key': 'value'
            }
        };
        const result = generateGoCode(options);
        expect(result).toContain('params.Add("key", "value")');
    });

    test('should generate correct code with array query parameters', () => {
        const options = {
            url: 'http://example.com',
            method: 'GET',
            query: {
                'key': ['value1', 'value2']
            }
        };
        const result = generateGoCode(options);
        expect(result).toContain('params.Add("key", "value1")');
        expect(result).toContain('params.Add("key", "value2")');
    });

    test('should generate correct code with complex query parameters', () => {
        const options = {
            url: 'http://example.com',
            method: 'GET',
            query: {
                'filter': 'active',
                'sort': ['name', 'date'],
                'page': '1',
                'limit': '10',
                'include': ['details', 'metadata']
            }
        };
        const result = generateGoCode(options);
        expect(result).toContain('params.Add("filter", "active")');
        expect(result).toContain('params.Add("sort", "name")');
        expect(result).toContain('params.Add("sort", "date")');
        expect(result).toContain('params.Add("page", "1")');
        expect(result).toContain('params.Add("limit", "10")');
        expect(result).toContain('params.Add("include", "details")');
        expect(result).toContain('params.Add("include", "metadata")');
    });
});