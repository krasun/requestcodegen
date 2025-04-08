import { JsonBody, RequestOptions } from "../request";

export function generateSwiftCode(options: RequestOptions): string {
    let code = `import Foundation\n\n`;
    
    // Build URL components first
    if (options.query) {
        code += `let components = URLComponents(string: "${options.url}")!\n`;
        code += `let queryItems: [URLQueryItem] = [\n`;
        code += Object.entries(options.query).map(([key, value]) => {
            if (Array.isArray(value)) {
                return value.map(v => `    URLQueryItem(name: "${key}", value: "${v}")`)
                    .join(",\n");
            }
            return `    URLQueryItem(name: "${key}", value: "${value}")`;
        }).join(",\n");
        code += `\n]\n`;
        code += `components.queryItems = queryItems\n\n`;
        code += `var request = URLRequest(url: components.url!,timeoutInterval: Double.infinity)\n`;
    } else {
        code += `var request = URLRequest(url: URL(string: "${options.url}")!,timeoutInterval: Double.infinity)\n`;
    }

    if (options.method) {
        code += `request.httpMethod = "${options.method}"\n`;
    }

    if (options.headers) {
        const headers = Object.entries(options.headers)
            .map(([key, value]) => `request.addValue("${value}", forHTTPHeaderField: "${key}")`)
            .join("\n");
        code += headers + "\n";
    }

    if (options.body) {
        if (options.body instanceof JsonBody) {
            code += `let parameters: [String: Any] = ${JSON.stringify(options.body.body, null, 4)}\n`;
            code += `request.httpBody = try? JSONSerialization.data(withJSONObject: parameters)\n`;
            code += `request.addValue("application/json", forHTTPHeaderField: "Content-Type")\n`;
        } else {
            code += `request.httpBody = "${options.body}".data(using: .utf8)\n`;
        }
    }

    code += `\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in\n`;
    code += `    if let error = error {\n`;
    code += `        print("Error: \\(error)")\n`;
    code += `        return\n`;
    code += `    }\n`;
    code += `    let response = data\n`;
    code += `}\n`;
    code += `task.resume()\n`;

    return code;
}
