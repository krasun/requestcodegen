import { describe, expect, test } from "@jest/globals";
import { generatePHPCode } from "./php";    

describe('generatePHPCode', () => {
    test('should generate PHP code with default method when no method is provided', () => {
        const options = { url: 'http://example.com' };
        const result = generatePHPCode(options);
        expect(result).toContain(`$method = 'GET';`);
    });

    test('should generate PHP code with provided method', () => {
        const options = { method: 'POST', url: 'http://example.com' };
        const result = generatePHPCode(options);
        expect(result).toContain(`$method = 'POST';`);
    });

    test('should generate PHP code with provided url', () => {
        const options = { url: 'http://example.com' };
        const result = generatePHPCode(options);
        expect(result).toContain(`$url = 'http://example.com';`);
    });

    test('should generate PHP code with provided query', () => {
        const options = { url: 'http://example.com', query: { param: 'value' } };
        const result = generatePHPCode(options);
        expect(result).toContain(`$query = http_build_query({"param":"value"});`);
    });

    test('should generate PHP code with provided headers', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generatePHPCode(options);
        expect(result).toContain(`'header' => {"Content-Type":"application/json"}`);
    });

    test('should generate PHP code with provided body', () => {
        const options = { url: 'http://example.com', body: 'body content' };
        const result = generatePHPCode(options);
        expect(result).toContain(`'content' => 'body content'`);
    });
});