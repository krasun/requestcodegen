import { describe, expect, test } from "@jest/globals";
import { generateWgetCode } from "./wget";    

describe('generateWgetCode', () => {
    test('should generate wget command for GET method', () => {
        const options = {
            method: 'GET',
            url: 'http://example.com',
        };
        const result = generateWgetCode(options);
        expect(result).toBe('wget \\\n  \'http://example.com\'');
    });

    test('should generate wget command for POST method', () => {
        const options = {
            method: 'POST',
            body: 'testBody',
            url: 'http://example.com',
        };
        const result = generateWgetCode(options);
        expect(result).toBe('wget --post-data \'testBody\' \\\n  \'http://example.com\'');
    });

    test('should generate wget command with headers', () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token',
            },
            url: 'http://example.com',
        };
        const result = generateWgetCode(options);
        expect(result).toBe('wget \\\n  --header \'Content-Type: application/json\' \\\n  --header \'Authorization: Bearer token\' \\\n  \'http://example.com\'');
    });

    test('should generate wget command with query parameters', () => {
        const options = {
            method: 'GET',
            query: {
                key1: 'value1',
                key2: 'value2',
            },
            url: 'http://example.com',
        };
        const result = generateWgetCode(options);
        expect(result).toBe('wget \\\n  \'http://example.com?key1=value1&key2=value2\'');
    });

    test('should generate wget command with all options', () => {
        const options = {
            method: 'POST',
            body: 'testBody',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token',
            },
            query: {
                key1: 'value1',
                key2: 'value2',
            },
            url: 'http://example.com',
        };
        const result = generateWgetCode(options);
        expect(result).toBe('wget --post-data \'testBody\' \\\n  --header \'Content-Type: application/json\' \\\n  --header \'Authorization: Bearer token\' \\\n  \'http://example.com?key1=value1&key2=value2\'');
    });
});