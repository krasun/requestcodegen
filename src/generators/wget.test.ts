import { describe, expect, test } from "@jest/globals";
import { generateWgetCode } from "./wget";    

describe('generateWgetCode', () => {
    test('should generate wget command for GET method', () => {
        const options = {
            method: 'GET',
            url: 'http://example.com',
        };
        const result = generateWgetCode(options);
        expect(result).toBe('wget \'http://example.com\'');
    });

    test('should generate wget command for POST method', () => {
        const options = {
            method: 'POST',
            body: 'testBody',
            url: 'http://example.com',
        };
        const result = generateWgetCode(options);
        expect(result).toBe('wget --post-data \'testBody\' \'http://example.com\'');
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
        expect(result).toBe('wget --header \'Content-Type: application/json\' --header \'Authorization: Bearer token\' \'http://example.com\'');
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
        expect(result).toBe('wget \'http://example.com?key1=value1&key2=value2\'');
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
        expect(result).toBe('wget --post-data \'testBody\' --header \'Content-Type: application/json\' --header \'Authorization: Bearer token\' \'http://example.com?key1=value1&key2=value2\'');
    });
});