import { RequestOptions } from "../request";

export function generateNodeFetchCode(options: RequestOptions): string {
    let code = `const fetch = require('node-fetch');
const querystring = require('querystring');

fetch('${options.url}${
        options.query
            ? "?' + querystring.stringify(" +
              JSON.stringify(options.query) +
              ")"
            : "'"
    }, {
    method: '${options.method || "GET"}',
    headers: ${JSON.stringify(options.headers || {})},
    body: '${options.body || ""}'
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
})
.catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
});`;

    return code;
}
