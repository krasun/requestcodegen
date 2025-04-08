import { describe, expect, test } from "@jest/globals";
import { generateRustCode } from "./rust";    
import { JsonBody } from "../request";

describe('generateRustCode', () => {
    test('should generate code with GET method by default', () => {
        const options = { url: 'http://example.com' };
        const result = generateRustCode(options);
        expect(result).toContain('Method::GET');
    });

    test('should generate code with provided method', () => {
        const options = { url: 'http://example.com', method: 'POST' };
        const result = generateRustCode(options);
        expect(result).toContain('Method::POST');
    });

    test('should generate code with query parameters', () => {
        const options = { url: 'http://example.com', query: { foo: 'bar', baz: ['qux', 'quux'] } };
        const result = generateRustCode(options);
        expect(result).toContain('let query_params: Value = serde_json::json!(');
        expect(result).toContain('"foo": "bar"');
        expect(result).toContain('"baz": [');
        expect(result).toContain('Value::Array(arr) =>');
    });

    test('should generate code with headers', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateRustCode(options);
        expect(result).toContain('.headers(');
        expect(result).toContain('"Content-Type": "application/json"');
        expect(result).toContain('.into())');
    });

    test('should generate code with body', () => {
        const options = { url: 'http://example.com', body: 'Hello, world!' };
        const result = generateRustCode(options);
        expect(result).toContain('.body("Hello, world!")');
    });

    test('should generate code with JSON body', () => {
        const options = { 
            url: 'http://example.com', 
            body: new JsonBody({ 
                name: 'John',
                age: 30
            })
        };
        const result = generateRustCode(options);
        expect(result).toContain('.json(&serde_json::json!(');
        expect(result).toContain('"name": "John"');
        expect(result).toContain('"age": 30');
    });
});