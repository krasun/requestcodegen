import { describe, expect, test } from "@jest/globals";
import { generateNodeFetchCode } from "./node-fetch";    

describe('generateNodeFetchCode', () => {
    test('should generate code with GET method by default', () => {
        const options = { url: 'https://example.com' };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("method: 'GET'");
    });

    test('should generate code with provided method', () => {
        const options = { url: 'https://example.com', method: 'POST' };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("method: 'POST'");
    });

    test('should generate code with provided headers', () => {
        const options = { url: 'https://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("headers: {\"Content-Type\":\"application/json\"}");
    });

    test('should generate code with provided body', () => {
        const options = { url: 'https://example.com', body: 'test body' };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("body: 'test body'");
    });

    test('should generate code with provided query parameters', () => {
        const options = { url: 'https://example.com', query: { param1: 'value1', param2: 'value2' } };
        const result = generateNodeFetchCode(options);
        expect(result).toContain("'https://example.com?' + querystring.stringify({\"param1\":\"value1\",\"param2\":\"value2\"})");
    });
});