import { RequestOptions } from "../request";

export function generateNodeAxiosCode(options: RequestOptions): string {
    const { url, query, method = 'GET', headers, body } = options;

    let axiosOptions = `{ method: '${method}', url: '${url}'`;
    if (query) {
        axiosOptions += `, params: ${JSON.stringify(query)}`;
    }
    if (headers) {
        axiosOptions += `, headers: ${JSON.stringify(headers)}`;
    }
    if (body) {
        axiosOptions += `, data: ${body}`;
    }
    axiosOptions += ' }';

    const code = `const axios = require('axios');\n\n` +
                 `axios(${axiosOptions})\n` +
                 `.then(function (response) {\n` +
                 `    // do something with the response...\n` +
                 `}).catch(function (error) {\n` +
                 `    console.error(error);\n` +
                 `});`;

    return code;
}