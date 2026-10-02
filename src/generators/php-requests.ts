import { Request, queryValues } from "../request";
import { unsupportedTarget } from "../errors";
import { phpString } from "../escape";
import { formatLiteral } from "./common";
import { PHP, phpArray } from "./php-common";

/** PHP with WpOrg\Requests 2 (composer require rmccue/requests). */
export function generatePHPRequestsCode(request: Request): string {
    if (request.headers.map(([, value]) => value).some((value) => value === "")) {
        unsupportedTarget("PHP (Requests)", "Requests does not send headers with empty values.", "headers");
    }
    let code = `<?php

require 'vendor/autoload.php';

$url = ${phpString(request.url)};
`;

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

    const headers = phpArray(
        request.headers.map(([key, value]) => [
            phpString(key),
            phpString(value),
        ])
    );
    code += `$headers = ${headers};\n`;
    code += `$body = ${request.body !== undefined ? phpString(request.body) : "[]"};\n`;

    code += `\n$response = \\WpOrg\\Requests\\Requests::request($url, $headers, $body, ${phpString(request.method)});`;

    return code;
}
