import { describe, expect, test } from "@jest/globals";
import { generateObjectiveCCode } from "./objective-c";    
import { JsonBody } from "../request";

describe('generateObjectiveCCode', () => {
    test('should return correct code when only url is provided', () => {
        const options = { url: 'https://example.com' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSURL *url = [NSURL URLWithString:@"https://example.com"]');
        expect(result).toContain('\nNSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url]');
    });

    test('should return correct code when headers are provided', () => {
        const options = { url: 'https://example.com', headers: { 'Content-Type': 'application/json' } };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSDictionary *headers = @{\n    @"Content-Type": @"application/json"\n};');
        expect(result).toContain('\n[headers enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSString *value, BOOL *stop)');
    });

    test('should return correct code when method is provided', () => {
        const options = { url: 'https://example.com', method: 'POST' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('[request setHTTPMethod:@"POST"]');
    });

    test('should return correct code when string body is provided', () => {
        const options = { url: 'https://example.com', body: 'test body' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSString *httpBodyString = @"test body";\n[request setHTTPBody:[httpBodyString dataUsingEncoding:NSUTF8StringEncoding]];');
    });

    test('should return correct code when JSON body is provided as string', () => {
        const options = { url: 'https://example.com', body: '{"key":"value","number":42}' };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSString *httpBodyString = @"{\"key\":\"value\",\"number\":42}";');
        expect(result).toContain('[request setHTTPBody:[httpBodyString dataUsingEncoding:NSUTF8StringEncoding]];');
    });

    test('should return correct code when JSON body is provided as object', () => {
        const options = { 
            url: 'https://example.com', 
            body: new JsonBody({ key: 'value', nested: { prop: true }, array: [1, 2, 3] })
        };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSDictionary *httpBody = @{\n    @"key": @"value",\n    @"nested": @{\n        @"prop": @YES\n    },\n    @"array": @[@1, @2, @3]\n};');
        expect(result).toContain('\nNSData *httpBodyData = [NSJSONSerialization dataWithJSONObject:httpBody options:0 error:nil]');
    });

    test('should return correct code when all options are provided', () => {
        const options = { 
            url: 'https://example.com', 
            headers: { 'Content-Type': 'application/json' }, 
            method: 'POST', 
            body: new JsonBody({ test: 'body' })
        };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSURL *url = [NSURL URLWithString:@"https://example.com"]');
        expect(result).toContain('\nNSDictionary *headers = @{\n    @"Content-Type": @"application/json"\n};');
        expect(result).toContain('[request setHTTPMethod:@"POST"]');
        expect(result).toContain('NSDictionary *httpBody = @{\n    @"test": @"body"\n};');
        expect(result).toContain('\nNSData *httpBodyData = [NSJSONSerialization dataWithJSONObject:httpBody options:0 error:nil]');
    });

    test('should return correct code when query parameters are provided', () => {
        const options = { 
            url: 'https://example.com', 
            query: { 
                key: 'value',
                numbers: ['42', '43'],
                flags: ['true', 'false']
            }
        };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('NSURLComponents *components = [[NSURLComponents alloc] initWithString:@"https://example.com"]');
        expect(result).toContain('NSMutableArray *queryItems = [NSMutableArray array]');
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"key" value:@"value"]]');
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"numbers" value:@"42"]]');
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"numbers" value:@"43"]]');
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"flags" value:@"true"]]');
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"flags" value:@"false"]]');
        expect(result).toContain('[components setQueryItems:queryItems]');
        expect(result).toContain('NSURL *url = [components URL]');
    });

    test('should return correct code when query parameters contain empty values', () => {
        const options = { 
            url: 'https://example.com', 
            query: { 
                empty: '',
                array: []
            }
        };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"empty" value:@""]]');
    });

    test('should return correct code when query parameters contain special characters', () => {
        const options = { 
            url: 'https://example.com', 
            query: { 
                'special chars': 'value with spaces',
                'encoded[]': ['value1', 'value2']
            }
        };
        const result = generateObjectiveCCode(options);
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"special chars" value:@"value with spaces"]]');
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"encoded[]" value:@"value1"]]');
        expect(result).toContain('[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"encoded[]" value:@"value2"]]');
    });
});