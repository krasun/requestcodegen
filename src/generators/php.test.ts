import { describe, expect, test } from "@jest/globals";
import { generatePHPCode } from "./php";    
import { JsonBody } from "../request";

describe('generatePHPCode', () => {
    test('should generate PHP code with default method when no method is provided', () => {
        const options = { url: 'http://example.com' };
        const result = generatePHPCode(options);
        expect(result).toContain(`$method = 'GET';`);
        expect(result).toContain(`$url = 'http://example.com';`);
    });

    test('should generate PHP code with provided method', () => {
        const options = { method: 'POST', url: 'http://example.com' };
        const result = generatePHPCode(options);
        expect(result).toContain(`$method = 'POST';`);
    });

    test('should generate PHP code with query parameters on separate lines', () => {
        const options = {
            url: 'http://example.com',
            query: {
                param1: 'value1',
                param2: ['value2', 'value3']
            }
        };
        const result = generatePHPCode(options);
        expect(result).toContain(`$query = [`);
        expect(result).toContain(`    'param1' => "value1",`);
        expect(result).toContain(`    'param2' => ["value2","value3"],`);
        expect(result).toContain(`$url .= '?' . http_build_query($query);`);
    });

    test('should generate PHP code with headers on separate lines', () => {
        const options = {
            url: 'http://example.com',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token'
            }
        };
        const result = generatePHPCode(options);
        expect(result).toContain(`        'header' => [`);
        expect(result).toContain(`            'Content-Type: application/json',`);
        expect(result).toContain(`            'Authorization: Bearer token',`);
    });

    test('should format JSON body properly', () => {
        const options = {
            url: 'http://example.com',
            body: new JsonBody({
                key1: 'value1',
                key2: {
                    nested: 'value2'
                },
                key3: ['item1', 'item2']
            })
        };
        const result = generatePHPCode(options);
        expect(result).toContain(`        'content' => json_encode([`);
        expect(result).toContain(`            'key1' => "value1",`);
        expect(result).toContain(`            'key2' => {"nested":"value2"},`);
        expect(result).toContain(`            'key3' => ["item1","item2"],`);
        expect(result).toContain(`        ]),`);
    });

    test('should handle string body content', () => {
        const options = {
            url: 'http://example.com',
            body: 'plain text content'
        };
        const result = generatePHPCode(options);
        expect(result).toContain(`        'content' => 'plain text content',`);
    });

    test('response variable should be the last one', () => {
        const options = { url: 'http://example.com' };
        const result = generatePHPCode(options);
        expect(result).toMatch(/\$response = [^;]+;$/);
    });
});