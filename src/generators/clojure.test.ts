import { describe, expect, test } from "@jest/globals";
import { generateClojureCode } from "./clojure";    

describe('generateClojureCode', () => {
    test('should generate code with only url', () => {
        const options = { url: 'http://example.com' };
        const result = generateClojureCode(options);
        expect(result).toContain(':url "http://example.com"');
    });

    test('should generate code with url and query', () => {
        const options = { url: 'http://example.com', query: { foo: 'bar' } };
        const result = generateClojureCode(options);
        expect(result).toContain(':url "http://example.com"');
        expect(result).toContain(':query-params {"foo" "bar"}');
    });

    test('should generate code with url and method', () => {
        const options = { url: 'http://example.com', method: 'POST' };
        const result = generateClojureCode(options);
        expect(result).toContain(':url "http://example.com"');
        expect(result).toContain(':method :post');
    });

    test('should generate code with url and headers', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateClojureCode(options);
        expect(result).toContain(':url "http://example.com"');
        expect(result).toContain(':headers {"Content-Type" "application/json"}');
    });

    test('should generate code with url and body', () => {
        const options = { url: 'http://example.com', body: 'Hello, World!' };
        const result = generateClojureCode(options);
        expect(result).toContain(':url "http://example.com"');
        expect(result).toContain(':body "Hello, World!"');
    });
});