import { RequestOptions } from "../request";

import querystring from 'querystring';

export function generateNodeHTTPCode(options: RequestOptions): string {
    let code = `const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: '${new URL(options.url).hostname}',
    port: ${new URL(options.url).port || 80},
    path: '${new URL(options.url).pathname}${options.query ? '?' + querystring.stringify(options.query) : ''}',
    method: '${options.method || 'GET'}',
    headers: ${options.headers ? JSON.stringify(options.headers) : '{}'}
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {});
    res.on('end', () => {});
});

req.on('error', (error) => {
    console.error(error);
});

${options.body ? `req.write('${options.body}');` : ''}
req.end();`;

    return code;
}