import { RequestOptions } from "../request";

export function generateObjectiveCCode(options: RequestOptions): string {
    let code = `
    #import <Foundation/Foundation.h>

    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"${options.url}"]
        cachePolicy:NSURLRequestUseProtocolCachePolicy
        timeoutInterval:10.0];
    NSArray *requestHeaders = [@"${Object.keys(options.headers || {}).join('", "')}",];
    NSArray *requestHeaderValues = [@"${Object.values(options.headers || {}).join('", "')}",];
    for (int i = 0; i < [requestHeaders count]; i++) {
        [request addValue:requestHeaderValues[i] forHTTPHeaderField:requestHeaders[i]];
    }
    [request setHTTPMethod:@"${options.method || 'GET'}"];
    `;

    if (options.body) {
        code += `
        NSString *httpBodyString = @"${options.body}";
        [request setHTTPBody:[httpBodyString dataUsingEncoding:NSUTF8StringEncoding]];
        `;
    }

    code += `
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request
        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            if (error) {
                NSLog(@"%@", error);
            }
        }];
    [dataTask resume];
    `;

    return code;
}