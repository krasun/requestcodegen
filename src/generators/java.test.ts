import { describe, expect, test } from "@jest/globals";
import { generateJavaCode } from "./java";    
import { JsonBody } from "../request";

describe('generateJavaCode', () => {
    test('should return correct code when only url is provided', () => {
        const options = { url: 'http://example.com' };
        const result = generateJavaCode(options);
        expect(result).toContain('StringBuilder urlBuilder = new StringBuilder("http://example.com")');
        expect(result).toContain('conn.setRequestMethod("GET")');
    });

    test('should return correct code when method is provided', () => {
        const options = { url: 'http://example.com', method: 'POST' };
        const result = generateJavaCode(options);
        expect(result).toContain('conn.setRequestMethod("POST")');
    });

    test('should return correct code when headers are provided', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateJavaCode(options);
        expect(result).toContain('conn.setRequestProperty("Content-Type", "application/json")');
    });

    test('should return correct code when query parameters are provided', () => {
        const options = { 
            url: 'http://example.com',
            query: { 
                param1: 'value1',
                arrayParam: ['value2', 'value3']
            }
        };
        const result = generateJavaCode(options);
        expect(result).toContain('params.add("param1", "value1")');
        expect(result).toContain('params.add("arrayParam", "value2")');
        expect(result).toContain('params.add("arrayParam", "value3")');
    });

    test('should return correct code when string body is provided', () => {
        const options = { url: 'http://example.com', body: 'Hello, World!' };
        const result = generateJavaCode(options);
        expect(result).toContain('"Hello, World!".getBytes("utf-8")');
    });

    test('should return correct code when JSON body is provided', () => {
        const options = { 
            url: 'http://example.com',
            body: new JsonBody({
                key1: 'value1',
                key2: 'value2'
            })
        };
        const result = generateJavaCode(options);
        expect(result).toContain('String.format(');
        expect(result).toContain('"key1": "value1"');
        expect(result).toContain('"key2": "value2"');
    });

    test('should return correct code when all options are provided', () => {
        const options = { 
            url: 'http://example.com',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            query: { param1: 'value1' },
            body: new JsonBody({ key1: 'value1' })
        };
        const result = generateJavaCode(options);
        expect(result).toContain('conn.setRequestMethod("POST")');
        expect(result).toContain('conn.setRequestProperty("Content-Type", "application/json")');
        expect(result).toContain('params.add("param1", "value1")');
        expect(result).toContain('String.format(');
        expect(result).toContain('"key1": "value1"');
    });
});