import { describe, expect, test } from "@jest/globals";
import { generateNodeFetchCode } from "./node-fetch";    
import { JsonBody } from "../request";

describe('generateNodeFetchCode', () => {
    test('should generate code with GET method by default', () => {
        const options = { url: 'https://example.com' };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("method: 'GET'");
        expect(result).toContain("const response = await fetch");
        expect(result).toContain("const data = await response.json()");
    });

    test('should generate code with provided method', () => {
        const options = { url: 'https://example.com', method: 'POST' };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("method: 'POST'");
    });

    test('should generate code with provided headers', () => {
        const options = { 
            url: 'https://example.com', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token'
            } 
        };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("'Content-Type': 'application/json'");
        expect(result).toContain("'Authorization': 'Bearer token'");
    });

    test('should generate code with provided string body', () => {
        const options = { url: 'https://example.com', body: 'test body' };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("body: 'test body'");
    });

    test('should generate code with provided JSON body', () => {
        const options = { 
            url: 'https://example.com', 
            body: new JsonBody({ 
                key1: 'value1',
                key2: 'value2'
            })
        };
        const result = generateNodeFetchCode(options);
        expect(result).toContain('"key1": "value1"');
        expect(result).toContain('"key2": "value2"');
    });

    test('should generate code with provided query parameters', () => {
        const options = { 
            url: 'https://example.com', 
            query: { 
                param1: 'value1',
                param2: ['value2', 'value3'],
                param3: '123'
            } 
        };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("const params = {");
        expect(result).toContain('"param1": "value1"');
        expect(result).toContain('"param2": [\n        "value2",\n        "value3"\n    ]');
        expect(result).toContain('"param3": "123"');
        expect(result).toContain("new URLSearchParams(params).toString()");
    });
});