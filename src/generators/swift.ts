import { Request, queryPairs } from "../request";
import { swiftString } from "../escape";

export function generateSwiftCode(request: Request): string {
    let code = `import Foundation\n\n`;

    if (request.query.length > 0) {
        code += `var components = URLComponents(string: ${swiftString(request.url)})!\n`;
        code += `components.queryItems = [\n`;
        code += queryPairs(request.query)
            .map(
                ([key, value]) =>
                    `    URLQueryItem(name: ${swiftString(key)}, value: ${swiftString(value)})`
            )
            .join(",\n");
        code += `\n]\n`;
        if (queryPairs(request.query).some(([key, value]) => (key + value).includes("+"))) {
            code += `components.percentEncodedQuery = components.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B")\n`;
        }
        code += `\n`;
        code += `var request = URLRequest(url: components.url!)\n`;
    } else {
        code += `var request = URLRequest(url: URL(string: ${swiftString(request.url)})!)\n`;
    }

    code += `request.httpMethod = ${swiftString(request.method)}\n`;

    for (const [key, value] of request.headers) {
        code += `request.setValue(${swiftString(value)}, forHTTPHeaderField: ${swiftString(key)})\n`;
    }

    if (request.body !== undefined) {
        code += `request.httpBody = ${swiftString(request.body)}.data(using: .utf8)\n`;
    }

    code += `\nlet (data, response) = try await URLSession.shared.data(for: request)\n`;

    return code;
}
