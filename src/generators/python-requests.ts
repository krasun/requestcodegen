import { JsonBody, RequestOptions } from "../request";

export function generatePythonRequestsCode(options: RequestOptions): string {
    let code = `import requests\n\n`;
    code += `def call_api():\n`;
    code += `    url = "${options.url}"\n`;

    if (options.query) {
        code += `    params = {\n`;
        Object.entries(options.query).forEach(([key, value]) => {
            code += `        "${key}": ${JSON.stringify(value)},\n`;
        });
        code += `    }\n`;
    } else {
        code += `    params = None\n`;
    }

    if (options.method) {
        code += `    method = "${options.method}"\n`;
    } else {
        code += `    method = "GET"\n`;
    }

    if (options.headers) {
        code += `    headers = {\n`;
        Object.entries(options.headers).forEach(([key, value]) => {
            code += `        "${key}": "${value}",\n`;
        });
        code += `    }\n`;
    } else {
        code += `    headers = None\n`;
    }

    if (options.body) {
        if (options.body instanceof JsonBody) {
            code += `    data = {\n`;
            Object.entries(options.body.body).forEach(([key, value]) => {
                code += `        "${key}": ${JSON.stringify(value)},\n`;
            });
            code += `    }\n`;
        } else {
            code += `    data = '${options.body}'\n`;
        }
    } else {
        code += `    data = None\n`;
    }

    code += `    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)\n`;

    return code;
}
