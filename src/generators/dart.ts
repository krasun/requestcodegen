import { RequestOptions } from "../request";

export function generateDartCode(options: RequestOptions): string {
    let code = `import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    var url = Uri.parse('${options.url}');`;

    if (options.query) {
        code += `\n    var queryParameters = ${JSON.stringify(options.query)};`;
        code += `\n    url = url.replace(queryParameters: queryParameters);`;
    }

    if (options.method === 'POST' || options.method === 'PUT') {
        code += `\n    var response = await http.${options.method.toLowerCase()}(url`;
        if (options.headers) {
            code += `, headers: ${JSON.stringify(options.headers)}`;
        }
        if (options.body) {
            code += `, body: '${options.body}'`;
        }
        code += `);`;
    } else {
        code += `\n    var response = await http.get(url`;
        if (options.headers) {
            code += `, headers: ${JSON.stringify(options.headers)}`;
        }
        code += `);`;
    }

    code += `\n    if (response.statusCode != 200) {
        throw Exception('Failed to load data');
    }
}`;

    return code;
}