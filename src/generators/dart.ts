import { JsonBody, RequestOptions } from "../request";

export function generateDartCode(options: RequestOptions): string {
    let code = `import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    final url = Uri.parse('${options.url}');`;

    if (options.query) {
        code += `\n    final queryParameters = ${JSON.stringify(
            options.query,
            null,
            4
        )
            .split("\n")
            .map((line, index) => (index === 0 ? line : "    " + line))
            .join("\n")};`;
        code += `\n    final urlWithQuery = url.replace(queryParameters: queryParameters);`;
    }

    if (options.method === "POST" || options.method === "PUT") {
        if (options.body && options.body instanceof JsonBody) {
            code += `\n`;
            code += `\n    final options = ${JSON.stringify(
                options.body.body,
                null,
                4
            )
                .split("\n")
                .map((line, index) => (index === 0 ? line : "    " + line))
                .join("\n")};`;
        }

        code += `\n\n    final response = await http.${options.method.toLowerCase()}(`;
        code += `\n        ${options.query ? "urlWithQuery" : "url"}`;

        if (options.headers) {
            code += `,\n        headers: ${JSON.stringify(
                options.headers,
                null,
                4
            )
                .split("\n")
                .map((line, index) => (index === 0 ? line : "        " + line))
                .join("\n")}`;
        }

        if (options.body) {
            if (options.body instanceof JsonBody) {
                code += `,\n        body: jsonEncode(options)`;
            } else {
                code += `,\n        body: '${options.body}'`;
            }
        }

        code += `\n    );`;
    } else {
        code += `\n\n    final response = await http.get(`;
        code += `\n        ${options.query ? "urlWithQuery" : "url"}`;

        if (options.headers) {
            code += `,\n        headers: ${JSON.stringify(
                options.headers,
                null,
                4
            )
                .split("\n")
                .map((line, index) => (index === 0 ? line : "        " + line))
                .join("\n")}`;
        }

        code += `\n    );`;
    }

    code += `\n\n    if (response.statusCode != 200) {
        throw Exception('Request failed with status: \${response.statusCode}');
    }

    // process response    
}`;

    return code;
}
