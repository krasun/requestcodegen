import { Request, queryValues } from "../request";
import { dartString, indent } from "../escape";

function dartMap(entries: [string, string][]): string {
    return `{\n${entries
        .map(([key, value]) => `    ${dartString(key)}: ${value},`)
        .join("\n")}\n}`;
}

export function generateDartCode(request: Request): string {
    const lines: string[] = [];
    let url = "url";

    lines.push(`final url = Uri.parse(${dartString(request.url)});`);

    if (request.query.length > 0) {
        const query = dartMap(
            queryValues(request.query).map(([key, value]) => [
                key,
                Array.isArray(value)
                    ? `[${value.map(dartString).join(", ")}]`
                    : dartString(value),
            ])
        );
        lines.push(`final queryParameters = ${indent(query, 4)};`);
        lines.push(`final urlWithQuery = url.replace(queryParameters: queryParameters);`);
        url = "urlWithQuery";
    }

    const headers = request.headers.length > 0
        ? dartMap(
              request.headers.map(([key, value]) => [key, dartString(value)])
          )
        : undefined;

    lines.push(``);
    if (request.method === "GET" && request.body === undefined) {
        lines.push(
            headers
                ? `final response = await http.get(\n    ${url},\n    headers: ${indent(headers, 4)},\n);`
                : `final response = await http.get(${url});`
        );
    } else {
        lines.push(`final request = http.Request(${dartString(request.method)}, ${url});`);
        if (headers) {
            lines.push(`request.headers.addAll(${indent(headers, 0)});`);
        }
        if (request.body !== undefined) {
            lines.push(`request.bodyBytes = utf8.encode(${dartString(request.body)});`);
        }
        lines.push(``);
        lines.push(`final response = await http.Response.fromStream(await request.send());`);
    }

    return `import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
${lines.map((line) => (line ? indent(`    ${line}`, 4) : "")).join("\n")}
}`;
}
