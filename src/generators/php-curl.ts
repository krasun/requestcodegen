import { phpString } from "../escape";
import { Request } from "../request";
import { phpArray, phpList } from "./php-common";

/** PHP with the curl extension (ext-curl). */
export function generatePHPCurlCode(request: Request): string {
    const options: [string, string][] = [];

    const hasArrays = request.query.some((entry) => entry.isArray);
    if (request.query.length > 0 && !hasArrays) {
        const params = phpArray(
            request.query.map(({ key, values }) => [phpString(key), phpString(values[0])]),
            1
        );
        options.push([
            "CURLOPT_URL",
            `${phpString(request.url + "?")} . http_build_query(${params})`,
        ]);
    } else {
        options.push(["CURLOPT_URL", phpString(request.fullUrl)]);
    }
    options.push(["CURLOPT_RETURNTRANSFER", "true"]);

    const { method, body } = request;
    const hasBody = body !== undefined;
    if (method === "HEAD" && !hasBody) {
        options.push(["CURLOPT_NOBODY", "true"]);
    } else if (!(method === "GET" && !hasBody) && !(method === "POST" && hasBody)) {
        options.push(["CURLOPT_CUSTOMREQUEST", phpString(method)]);
    }

    if (request.headers.length > 0) {
        options.push([
            "CURLOPT_HTTPHEADER",
            phpList(
                request.headers.map(([name, value]) =>
                    phpString(value === "" ? `${name};` : `${name}: ${value}`)
                ),
                1
            ),
        ]);
    }

    if (hasBody) {
        options.push(["CURLOPT_POSTFIELDS", phpString(body)]);
    }

    if (request.followRedirects) {
        options.push(["CURLOPT_FOLLOWLOCATION", "true"]);
    }
    if (request.compressed) {
        // An empty string enables every encoding libcurl supports.
        options.push(["CURLOPT_ENCODING", "''"]);
    }

    return `<?php

$ch = curl_init();

curl_setopt_array($ch, ${phpArray(options)});

$response = curl_exec($ch);`;
}
