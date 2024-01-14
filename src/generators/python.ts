import { RequestOptions } from "../request";

export function generatePythonCode(options: RequestOptions): string {
    let code = `import requests\n\n`;
    code += `def call_api():\n`;
    code += `    url = "${options.url}"\n`;

    if (options.query) {
        code += `    params = ${JSON.stringify(options.query)}\n`;
    } else {
        code += `    params = None\n`;
    }

    if (options.method) {
        code += `    method = "${options.method}"\n`;
    } else {
        code += `    method = "GET"\n`;
    }

    if (options.headers) {
        code += `    headers = ${JSON.stringify(options.headers)}\n`;
    } else {
        code += `    headers = None\n`;
    }

    if (options.body) {
        code += `    data = '${options.body}'\n`;
    } else {
        code += `    data = None\n`;
    }

    code += `    response = requests.request(method, url, headers=headers, params=params, data=data)\n`;
    code += `    if response.status_code != 200:\n`;
    code += `        raise Exception(f"Request failed with status {response.status_code}")\n`;

    return code;
}