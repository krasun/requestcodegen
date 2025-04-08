import { RequestOptions, JsonBody } from "../request";

export function generateNodeFetchCode(options: RequestOptions): string {
    const queryParams = options.query ? `\n    ${JSON.stringify(options.query, null, 4).replace(/^{/, '').replace(/}$/, '').trim()}\n` : '';
    const bodyContent = options.body instanceof JsonBody ? 
        `\n    ${JSON.stringify(options.body.body, null, 4).replace(/^{/, '').replace(/}$/, '').trim()}\n` : 
        options.body;

    const code = `const fetch = require('node-fetch');

const params = {${queryParams}};
const url = '${options.url}' + (Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '');

const options = {
    method: '${options.method || "GET"}'${options.headers ? `,
    headers: {
        ${Object.entries(options.headers).map(([key, value]) => `'${key}': '${value}'`).join(',\n        ')}
    }` : ''}${bodyContent ? `,
    body: ${options.body instanceof JsonBody ? `{${bodyContent}}` : `'${bodyContent}'`}` : ''}
};

const response = await fetch(url, options);
const data = await response.json();`;

    return code;
}
