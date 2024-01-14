import { RequestOptions } from "../request";

export function generateCurlCode(options: RequestOptions): string {
    let curlCode = `curl -X ${options.method || 'GET'} '${options.url}`;

    if (options.query) {
        const queryString = Object.entries(options.query)
            .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`)
            .join('&');
        curlCode += `?${queryString}`;
    }

    curlCode += `'`;

    if (options.headers) {
        const headersString = Object.entries(options.headers)
            .map(([key, value]) => `-H '${key}: ${value}'`)
            .join(' ');
        curlCode += ` ${headersString}`;
    }

    if (options.body) {
        curlCode += ` -d '${options.body}'`;
    }

    return curlCode;
}