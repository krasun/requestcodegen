import { describe, expect, test } from "@jest/globals";
import { generateRubyCode } from "./ruby";    

describe('generateRubyCode', () => {
    test('should generate basic code with only url', () => {
        const options = { url: 'http://example.com' };
        const result = generateRubyCode(options);
        expect(result).toContain(`uri = URI.parse("http://example.com")`);
    });

    test('should generate code with query parameters', () => {
        const options = { url: 'http://example.com', query: { param1: 'value1', param2: 'value2' } };
        const result = generateRubyCode(options);
        expect(result).toContain(`uri.query = "param1=#{value1}&param2=#{value2}"`);
    });

    test('should generate code with headers', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateRubyCode(options);
        expect(result).toContain(`request["Content-Type"] = "application/json"`);
    });

    test('should generate code with body', () => {
        const options = { url: 'http://example.com', body: 'body content' };
        const result = generateRubyCode(options);
        expect(result).toContain(`request.body = 'body content'`);
    });

    test('should generate code with custom HTTP method', () => {
        const options = { url: 'http://example.com', method: 'Post' };
        const result = generateRubyCode(options);
        expect(result).toContain(`request = Net::HTTP::Post.new(uri.request_uri)`);
    });
});