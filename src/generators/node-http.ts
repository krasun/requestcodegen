import { JsonBody, RequestOptions } from "../request";

export function generateNodeHTTPCode(options: RequestOptions): string {
    const url = new URL(options.url);
    const isHttps = url.protocol === "https:";
    const defaultPort = isHttps ? 443 : 80;

    // Format query parameters as a proper object if present
    let queryObject = "";
    if (options.query && Object.keys(options.query).length > 0) {
        queryObject = `const query = {\n    ${Object.entries(options.query)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(",\n    ")}\n};\n\n`;
    }

    // Format body as a proper JSON object if it's JSON
    let bodyObject = "";
    if (options.body) {
        if (options.body instanceof JsonBody) {
            const parsedBody = options.body.body;
            if (typeof parsedBody === "object") {
                bodyObject = `const body = {\n    ${Object.entries(parsedBody)
                    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                    .join(",\n    ")}\n};\n\n`;
            }
        } else {
            // If not JSON, use as is
            bodyObject = `const body = ${JSON.stringify(options.body)};\n\n`;
        }
    }

    const code = `const ${isHttps ? "https" : "http"} = require('${
        isHttps ? "https" : "http"
    }');
${
    options.query ? "const querystring = require('querystring');\n" : ""
}${queryObject}${bodyObject}const options = {
    hostname: '${url.hostname}',
    port: ${url.port || defaultPort},
    path: '${url.pathname}'${
        options.query ? " + '?' + querystring.stringify(query)" : ""
    },
    method: '${options.method || "GET"}',
    headers: ${JSON.stringify(options.headers || {})}
};

let response = '';
const req = ${isHttps ? "https" : "http"}.request(options, (res) => {
    res.on('data', (chunk) => {
        response += chunk;
    });
});

req.on('error', (error) => {
    console.error(error);
});
${
    options.body
        ? options.body instanceof JsonBody
            ? "\nreq.write(JSON.stringify(body));"
            : "\nreq.write(body);"
        : ""
}
req.end();`;

    return code;
}
