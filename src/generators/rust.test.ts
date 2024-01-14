import { describe, expect, test } from "@jest/globals";
import { generateRustCode } from "./rust";    

describe('generateRustCode', () => {
    test('should generate code with GET method by default', () => {
        const options = { url: 'http://example.com' };
        const result = generateRustCode(options);
        expect(result).toContain('let method = Method::GET;');
    });

    test('should generate code with provided method', () => {
        const options = { url: 'http://example.com', method: 'POST' };
        const result = generateRustCode(options);
        expect(result).toContain('let method = Method::from_bytes(b"POST").unwrap();');
    });

    test('should generate code with query parameters', () => {
        const options = { url: 'http://example.com', query: { foo: 'bar', baz: ['qux', 'quux'] } };
        const result = generateRustCode(options);
        expect(result).toContain('params.insert("foo", "bar");');
        expect(result).toContain('params.insert("baz", "qux");');
        expect(result).toContain('params.insert("baz", "quux");');
    });

    test('should generate code with headers', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateRustCode(options);
        expect(result).toContain('headers.insert("Content-Type", "application/json".parse().unwrap());');
    });

    test('should generate code with body', () => {
        const options = { url: 'http://example.com', body: 'Hello, world!' };
        const result = generateRustCode(options);
        expect(result).toContain('request.body("Hello, world!");');
    });
});