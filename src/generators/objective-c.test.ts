import { describe, expect, test } from "@jest/globals";
import { generateObjectiveCCode } from "./objective-c";    

describe('generateObjectiveCCode', () => {
    test('should return correct code when only url is provided', () => {
        const options = { url: 'https://example.com' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"https://example.com"]');
    });

    test('should return correct code when headers are provided', () => {
        const options = { url: 'https://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSArray *requestHeaders = [@"Content-Type",];');
        expect(result).toContain('NSArray *requestHeaderValues = [@"application/json",];');
    });

    test('should return correct code when method is provided', () => {
        const options = { url: 'https://example.com', method: 'POST' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('[request setHTTPMethod:@"POST"];');
    });

    test('should return correct code when body is provided', () => {
        const options = { url: 'https://example.com', body: 'test body' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSString *httpBodyString = @"test body";');
        expect(result).toContain('[request setHTTPBody:[httpBodyString dataUsingEncoding:NSUTF8StringEncoding]];');
    });

    test('should return correct code when all options are provided', () => {
        const options = { url: 'https://example.com', headers: { 'Content-Type': 'application/json' }, method: 'POST', body: 'test body' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"https://example.com"]');
        expect(result).toContain('NSArray *requestHeaders = [@"Content-Type",];');
        expect(result).toContain('NSArray *requestHeaderValues = [@"application/json",];');
        expect(result).toContain('[request setHTTPMethod:@"POST"];');
        expect(result).toContain('NSString *httpBodyString = @"test body";');
        expect(result).toContain('[request setHTTPBody:[httpBodyString dataUsingEncoding:NSUTF8StringEncoding]];');
    });
});