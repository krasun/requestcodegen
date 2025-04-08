import { RequestOptions, JsonBody } from "../request";

export function generatePHPCode(options: RequestOptions): string {
    let code = `<?php

$method = '${options.method || 'GET'}';
$url = '${options.url}';\n`;

    if (options.query) {
        code += `$query = [\n`;
        for (const [key, value] of Object.entries(options.query)) {
            code += `    '${key}' => ${JSON.stringify(value)},\n`;
        }
        code += `];\n`;
        code += `$url .= '?' . http_build_query($query);\n`;
    }

    code += `\n$options = [\n`;
    code += `    'http' => [\n`;
    code += `        'method' => $method,\n`;

    if (options.headers) {
        code += `        'header' => [\n`;
        for (const [key, value] of Object.entries(options.headers)) {
            code += `            '${key}: ${value}',\n`;
        }
        code += `        ],\n`;
    }

    if (options.body) {
        if (options.body instanceof JsonBody) {
            code += `        'content' => json_encode([\n`;
            for (const [key, value] of Object.entries(options.body.body)) {
                code += `            '${key}' => ${JSON.stringify(value)},\n`;
            }
            code += `        ]),\n`;
        } else {
            code += `        'content' => '${options.body}',\n`;
        }
    }

    code += `    ],\n`;
    code += `];\n\n`;

    code += `$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);`;

    return code;
}