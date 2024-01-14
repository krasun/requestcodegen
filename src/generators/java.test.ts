import { describe, expect, test } from "@jest/globals";
import { generateJavaCode } from "./java";    

describe('generateJavaCode', () => {
    test('should return correct code when only url is provided', () => {
        const options = { url: 'http://example.com' };
        const result = generateJavaCode(options);
        expect(result).toContain('URL url = new URL("http://example.com");');
        expect(result).toContain('conn.setRequestMethod("GET");');
    });

    test('should return correct code when method is provided', () => {
        const options = { url: 'http://example.com', method: 'POST' };
        const result = generateJavaCode(options);
        expect(result).toContain('conn.setRequestMethod("POST");');
    });

    test('should return correct code when headers are provided', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateJavaCode(options);
        expect(result).toContain('conn.setRequestProperty("Content-Type", "application/json");');
    });

    test('should return correct code when body is provided', () => {
        const options = { url: 'http://example.com', body: 'Hello, World!' };
        const result = generateJavaCode(options);
        expect(result).toContain('String input = "Hello, World!";');
    });

    test('should return correct code when all options are provided', () => {
        const options = { url: 'http://example.com', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'Hello, World!' };
        const result = generateJavaCode(options);
        expect(result).toContain('URL url = new URL("http://example.com");');
        expect(result).toContain('conn.setRequestMethod("POST");');
        expect(result).toContain('conn.setRequestProperty("Content-Type", "application/json");');
        expect(result).toContain('String input = "Hello, World!";');
    });
});