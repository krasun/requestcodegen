import { RequestOptions } from "../request";

export function generateSwiftCode(options: RequestOptions): string {
    let code = `import Foundation\n\n`;

    code += `var request = URLRequest(url: URL(string: "${options.url}")!,timeoutInterval: Double.infinity)\n`;

    if (options.method) {
        code += `request.httpMethod = "${options.method}"\n`;
    }

    if (options.headers) {
        for (const key in options.headers) {
            code += `request.addValue("${options.headers[key]}", forHTTPHeaderField: "${key}")\n`;
        }
    }

    if (options.body) {
        code += `request.httpBody = "${options.body}".data(using: .utf8)\n`;
    }

    if (options.query) {
        let queryItems = [];
        for (const key in options.query) {
            let value = options.query[key];
            if (Array.isArray(value)) {
                value.forEach((v) => {
                    queryItems.push(`URLQueryItem(name: "${key}", value: "${v}")`);
                });
            } else {
                queryItems.push(`URLQueryItem(name: "${key}", value: "${value}")`);
            }
        }
        code += `var components = URLComponents(url: request.url!, resolvingAgainstBaseURL: false)!\n`;
        code += `components.queryItems = [${queryItems.join(', ')}]\n`;
        code += `request.url = components.url\n`;
    }

    code += `let task = URLSession.shared.dataTask(with: request) { data, response, error in\n`;
    code += `  guard let data = data else {\n`;
    code += `    print(String(describing: error))\n`;
    code += `    return\n`;
    code += `  }\n`;
    code += `}\n`;
    code += `task.resume()\n`;

    return code;
}