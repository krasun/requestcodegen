import { describe, expect, test } from "@jest/globals";
import { generateGoCode } from "./go";    

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
        expect(result).toContain('var jsonStr = []byte(`{"key":"value"}`)');
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
});