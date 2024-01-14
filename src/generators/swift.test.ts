import { describe, expect, test } from "@jest/globals";
import { generateSwiftCode } from "./swift";    

describe('generateSwiftCode', () => {
    test('should generate code with only url', () => {
        const options = { url: 'https://example.com' };
        const result = generateSwiftCode(options);
        expect(result).toContain('import Foundation');
        expect(result).toContain('var request = URLRequest(url: URL(string: "https://example.com")!,timeoutInterval: Double.infinity)');
        expect(result).toContain('let task = URLSession.shared.dataTask(with: request)');
    });

    test('should generate code with url and method', () => {
        const options = { url: 'https://example.com', method: 'POST' };
        const result = generateSwiftCode(options);
        expect(result).toContain('request.httpMethod = "POST"');
    });

    test('should generate code with url, method and headers', () => {
        const options = { url: 'https://example.com', method: 'POST', headers: { 'Content-Type': 'application/json' } };
        const result = generateSwiftCode(options);
        expect(result).toContain('request.addValue("application/json", forHTTPHeaderField: "Content-Type")');
    });

    test('should generate code with url, method, headers and body', () => {
        const options = { url: 'https://example.com', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"key":"value"}' };
        const result = generateSwiftCode(options);
        expect(result).toContain('request.httpBody = "{"key":"value"}".data(using: .utf8)');
    });

    test('should generate code with url, method, headers, body and query', () => {
        const options = { url: 'https://example.com', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"key":"value"}', query: { 'param': 'value' } };
        const result = generateSwiftCode(options);
        expect(result).toContain('URLQueryItem(name: "param", value: "value")');
    });
});