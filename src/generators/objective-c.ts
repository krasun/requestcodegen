import { Request, queryPairs } from "../request";
import { objcString } from "../escape";

export function generateObjectiveCCode(request: Request): string {
    const lines: string[] = [];

    if (request.query.length > 0) {
        lines.push(
            `NSURLComponents *components = [[NSURLComponents alloc] initWithString:${objcString(request.url)}];`
        );
        lines.push(`NSMutableArray *queryItems = [NSMutableArray array];`);
        for (const [key, value] of queryPairs(request.query)) {
            lines.push(
                `[queryItems addObject:[[NSURLQueryItem alloc] initWithName:${objcString(key)} value:${objcString(value)}]];`
            );
        }
        lines.push(`[components setQueryItems:queryItems];`);
        if (queryPairs(request.query).some(([key, value]) => (key + value).includes("+"))) {
            lines.push(
                `components.percentEncodedQuery = [components.percentEncodedQuery stringByReplacingOccurrencesOfString:@"+" withString:@"%2B"];`
            );
        }
        lines.push(`NSURL *url = [components URL];`);
    } else {
        lines.push(`NSURL *url = [NSURL URLWithString:${objcString(request.url)}];`);
    }

    lines.push(``);
    lines.push(`NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];`);
    lines.push(`[request setHTTPMethod:${objcString(request.method)}];`);

    for (const [key, value] of request.headers) {
        lines.push(`[request setValue:${objcString(value)} forHTTPHeaderField:${objcString(key)}];`);
    }

    if (request.body !== undefined) {
        lines.push(
            `[request setHTTPBody:[${objcString(request.body)} dataUsingEncoding:NSUTF8StringEncoding]];`
        );
    }

    lines.push(``);
    lines.push(`NSURLSession *session = [NSURLSession sharedSession];`);
    lines.push(
        `NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {`
    );
    lines.push(`    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;`);
    lines.push(`}];`);
    lines.push(`[task resume];`);

    return lines.join("\n");
}
