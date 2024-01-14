import { RequestOptions } from "../request";

export function generatePHPGuzzleCode(options: RequestOptions): string {
    let code = `<?php\n`;
    code += `require 'vendor/autoload.php';\n`;
    code += `\n`;
    code += `$client = new \\GuzzleHttp\\Client();\n`;
    code += `\n`;
    code += `try {\n`;
    code += `    $response = $client->request('${options.method || "GET"}', '${
        options.url
    }', [\n`;

    if (options.headers) {
        code += `        'headers' => [\n`;
        for (const key in options.headers) {
            code += `            '${key}' => '${options.headers[key]}',\n`;
        }
        code += `        ],\n`;
    }

    if (options.query) {
        code += `        'query' => [\n`;
        for (const key in options.query) {
            code += `            '${key}' => '${options.query[key]}',\n`;
        }
        code += `        ],\n`;
    }

    if (options.body) {
        code += `        'body' => '${options.body}',\n`;
    }

    code += `    ]);\n`;
    code += `} catch (\\GuzzleHttp\\Exception\\RequestException $e) {\n`;
    code += `    echo 'Request failed: ' . $e->getMessage();\n`;
    code += `}\n`;
    code += `?>`;

    return code;
}
