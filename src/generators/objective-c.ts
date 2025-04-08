import { RequestOptions, JsonBody } from "../request";

export function generateObjectiveCCode(options: RequestOptions): string {
    const headers = options.headers ? Object.entries(options.headers) : [];
    let bodyCode = "";
    let urlCode = "";

    // Handle query parameters
    if (options.query && Object.keys(options.query).length > 0) {
        urlCode = `NSURLComponents *components = [[NSURLComponents alloc] initWithString:@"${options.url}"];
NSMutableArray *queryItems = [NSMutableArray array];
${Object.entries(options.query)
    .map(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map(v => `[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"${key}" value:${formatObjectiveCValue(v)}]];`).join("\n");
        }
        return `[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"${key}" value:${formatObjectiveCValue(value)}]];`;
    })
    .join("\n")}
[components setQueryItems:queryItems];
NSURL *url = [components URL];`;
    } else {
        urlCode = `NSURL *url = [NSURL URLWithString:@"${options.url}"];`;
    }

    if (options.body) {
        if (options.body instanceof JsonBody) {
            bodyCode = `NSDictionary *httpBody = @{${Object.entries(options.body.body)
    .map(([key, value]) => `\n    @"${key}": ${formatObjectiveCValue(value)}`)
    .join(",")}
};

NSData *httpBodyData = [NSJSONSerialization dataWithJSONObject:httpBody options:0 error:nil];
[request setHTTPBody:httpBodyData];`;
        } else {
            bodyCode = `NSString *httpBodyString = @"${options.body}";
[request setHTTPBody:[httpBodyString dataUsingEncoding:NSUTF8StringEncoding]];`;
        }
    }

    const code = `${urlCode}

NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
[request setCachePolicy:NSURLRequestUseProtocolCachePolicy];
[request setTimeoutInterval:10.0];
[request setHTTPMethod:@"${options.method || "GET"}"];
${headers.length > 0 ? `
NSDictionary *headers = @{${headers.map(([key, value]) => `\n    @"${key}": @"${value}"`).join(",")}
};

[headers enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSString *value, BOOL *stop) {
    [request setValue:value forHTTPHeaderField:key];
}];` : ""}${bodyCode ? `\n${bodyCode}` : ""}

NSURLSession *session = [NSURLSession sharedSession];
NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
}];
[task resume];`;

    return code;
}

function formatObjectiveCValue(value: any): string {
    if (typeof value === "string") {
        return `@"${value}"`;
    } else if (typeof value === "number") {
        return `@${value}`;
    } else if (typeof value === "boolean") {
        return value ? `@YES` : `@NO`;
    } else if (Array.isArray(value)) {
        return `@[${value.map((v) => formatObjectiveCValue(v)).join(", ")}]`;
    } else if (value === null) {
        return `[NSNull null]`;
    } else if (typeof value === "object") {
        const entries = Object.entries(value);
        if (entries.length === 0) return `@{}`;
        return `@{${entries.map(([k, v]) => `\n        @"${k}": ${formatObjectiveCValue(v)}`).join(",")}\n    }`;
    }
    return `@""`;
}
