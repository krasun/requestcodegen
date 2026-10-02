import { phpString } from "../escape";
import { findHeader, Request } from "../request";
import { formatLiteral } from "./common";
import { PHP, phpArray } from "./php-common";

/** PHP with Guzzle 7 (composer require guzzlehttp/guzzle). */
export function generatePHPGuzzleCode(request: Request): string {
    const options: [string, string][] = [];

    if (request.query.length > 0) {
        const params = phpArray(
            request.query.map(({ key, values, isArray }) => [
                phpString(key),
                formatLiteral(isArray ? values : values[0], PHP, 2),
            ]),
            1
        );
        // Query::build() repeats keys for lists instead of writing key[0]=.
        options.push([
            "'query'",
            request.query.some((entry) => entry.isArray)
                ? `\\GuzzleHttp\\Psr7\\Query::build(${params})`
                : params,
        ]);
    }

    if (request.headers.length > 0) {
        options.push([
            "'headers'",
            phpArray(
                request.headers.map(([name, value]) => [phpString(name), phpString(value)]),
                1
            ),
        ]);
    }

    if (request.body !== undefined) {
        options.push(["'body'", phpString(request.body)]);
    }

    if (request.followRedirects === false) {
        options.push(["'allow_redirects'", "false"]);
    }
    if (request.compressed && findHeader(request.headers, "Accept-Encoding") === undefined) {
        // A string value is sent as Accept-Encoding and the response is decoded.
        options.push(["'decode_content'", "'gzip, deflate'"]);
    }

    const args = [phpString(request.method), phpString(request.url)];
    if (options.length > 0) {
        args.push(phpArray(options));
    }

    return `<?php

require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();

$response = $client->request(${args.join(", ")});`;
}
