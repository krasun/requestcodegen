import { Request, queryValues } from "../request";
import { phpString } from "../escape";
import { formatLiteral } from "./common";
import { PHP, phpArray, phpList } from "./php-common";

/** PHP with stream contexts (file_get_contents), no extensions required. */
export function generatePHPCode(request: Request): string {
    let code = `<?php

$method = ${phpString(request.method)};
$url = ${phpString(request.url)};\n`;

    if (request.query.length > 0) {
        const hasArrays = request.query.some((entry) => entry.isArray);
        const query = phpArray(
            queryValues(request.query).map(([key, value]) => [
                phpString(key),
                formatLiteral(value, PHP, 1),
            ])
        );
        code += `$query = ${query};\n`;
        code += hasArrays
            ? `$url .= '?' . preg_replace('/%5B\\d+%5D=/', '=', http_build_query($query));\n`
            : `$url .= '?' . http_build_query($query);\n`;
    }

    const http: [string, string][] = [["'method'", "$method"]];
    if (request.headers.length > 0) {
        http.push([
            "'header'",
            phpList(
                request.headers.map(([key, value]) =>
                    phpString(`${key}: ${value}`)
                ),
                2
            ),
        ]);
    }
    if (request.body !== undefined) {
        http.push(["'content'", phpString(request.body)]);
    }
    http.push(["'ignore_errors'", "true"]);

    code += `\n$options = ${phpArray([["'http'", phpArray(http, 1)]])};\n\n`;
    code += `$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);`;

    return code;
}
