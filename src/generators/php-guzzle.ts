import { RequestOptions, JsonBody } from "../request";

export function generatePHPGuzzleCode(options: RequestOptions): string {
    let code = `<?php

require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();

$requestOptions = [];`;

    if (options.headers) {
        code += `\n\n$requestOptions['headers'] = [`;
        for (const [key, value] of Object.entries(options.headers)) {
            code += `\n    '${key}' => '${value}',`;
        }
        code += `\n];`;
    }

    if (options.query) {
        code += `\n\n$requestOptions['query'] = [`;
        for (const [key, value] of Object.entries(options.query)) {
            if (Array.isArray(value)) {
                for (const v of value) {
                    code += `\n    '${key}[]' => '${v}',`;
                }
            } else {
                code += `\n    '${key}' => '${value}',`;
            }
        }
        code += `\n];`;
    }

    if (options.body) {
        if (options.body instanceof JsonBody) {
            code += `\n\n$requestOptions['json'] = [`;
            for (const [key, value] of Object.entries(options.body.body)) {
                code += `\n    '${key}' => ${JSON.stringify(value)},`;
            }
            code += `\n];`;
        } else {
            code += `\n\n$requestOptions['body'] = '${options.body}';`;
        }
    }

    code += `\n\ntry {
    $response = $client->request('${options.method || "GET"}', '${options.url}', $requestOptions);
} catch (\\GuzzleHttp\\Exception\\RequestException $e) {
    $error = $e->getMessage();
}`;

    return code;
}
