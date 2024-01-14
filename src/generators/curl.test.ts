import { describe, expect, test } from "@jest/globals";
import { generateCurlCode } from "./curl";    

describe('generateCurlCode', () => {
    test('should generate curl code with GET method and no query, headers or body', () => {
        const options = {
            method: 'GET',
            url: 'https://example.com',
        };
        expect(generateCurlCode(options)).toBe("curl -X GET 'https://example.com'");
    });

    test('should generate curl code with POST method and query parameters', () => {
        const options = {
            method: 'POST',
            url: 'https://example.com',
            query: {
                param1: 'value1',
                param2: 'value2',
            },
        };
        expect(generateCurlCode(options)).toBe("curl -X POST 'https://example.com?param1=value1&param2=value2'");
    });

    test('should generate curl code with PUT method, headers and body', () => {
        const options = {
            method: 'PUT',
            url: 'https://example.com',
            headers: {
                'Content-Type': 'application/json',
            },
            body: '{"key":"value"}',
        };
        expect(generateCurlCode(options)).toBe("curl -X PUT 'https://example.com' -H 'Content-Type: application/json' -d '{\"key\":\"value\"}'");
    });

    test('should generate curl code with DELETE method and array query parameters', () => {
        const options = {
            method: 'DELETE',
            url: 'https://example.com',
            query: {
                param: ['value1', 'value2'],
            },
        };
        expect(generateCurlCode(options)).toBe("curl -X DELETE 'https://example.com?param=value1,value2'");
    });

    test('should generate curl code with PATCH method, headers, query parameters and body', () => {
        const options = {
            method: 'PATCH',
            url: 'https://example.com',
            query: {
                param: 'value',
            },
            headers: {
                'Content-Type': 'application/json',
            },
            body: '{"key":"value"}',
        };
        expect(generateCurlCode(options)).toBe("curl -X PATCH 'https://example.com?param=value' -H 'Content-Type: application/json' -d '{\"key\":\"value\"}'");
    });
});