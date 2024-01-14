import { RequestOptions } from "../request";

export function generatePHPCode(options: RequestOptions): string {
    let code = `<?php\n\n`;

    if (options.method) {
        code += `$method = '${options.method}';\n`;
    } else {
        code += `$method = 'GET';\n`;
    }

    if (options.url) {
        code += `$url = '${options.url}';\n`;
    }

    if (options.query) {
        code += `$query = http_build_query(${JSON.stringify(options.query)});\n`;
        code += `$url .= '?' . $query;\n`;
    }

    code += `$options = [\n`;
    code += `    'http' => [\n`;
    code += `        'method' => $method,\n`;

    if (options.headers) {
        code += `        'header' => ${JSON.stringify(options.headers).replace(/,/g, ',\n')},\n`;
    }

    if (options.body) {
        code += `        'content' => '${options.body}',\n`;
    }

    code += `    ],\n`;
    code += `];\n\n`;

    code += `$context = stream_context_create($options);\n`;
    code += `$result = file_get_contents($url, false, $context);\n\n`;

    code += `if ($result === FALSE) { /* Handle error */ }\n\n`;

    code += `?>`;

    return code;
}