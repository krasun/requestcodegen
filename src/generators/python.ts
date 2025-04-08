import { JsonBody, RequestOptions } from "../request";

export function generatePythonCode(options: RequestOptions): string {
    let code = `from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import json
import ssl

def call_api():
    url = "${options.url}"\n`;

    if (options.query) {
        code += `    query_params = {\n`;
        Object.entries(options.query).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                code += `        "${key}": ${JSON.stringify(value)},\n`;
            } else {
                code += `        "${key}": "${value}",\n`;
            }
        });
        code += `    }\n`;
        code += `    url = f"{url}?{urlencode(query_params)}"\n`;
    }

    code += `    request = Request(url)\n`;
    code += `    request.method = "${options.method || "GET"}"\n`;

    if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
            code += `    request.add_header("${key}", "${value}")\n`;
        });
    }

    if (options.body) {
        let bodyData;
        if (options.body instanceof JsonBody) {
            bodyData = options.body.body;
            if (typeof bodyData === "object" && bodyData !== null) {
                code += `    data = {\n`;
                Object.entries(bodyData).forEach(([key, value]) => {
                    if (typeof value === "object" && value !== null) {
                        code += `        "${key}": ${JSON.stringify(
                            value,
                            null,
                            8
                        ).replace(/\n/g, "\n        ")},\n`;
                    } else {
                        code += `        "${key}": ${JSON.stringify(value)},\n`;
                    }
                });
                code += `    }\n`;
                code += `    request.data = json.dumps(data).encode()\n`;
            } else {
                code += `    request.data = '${options.body}'.encode()\n`;
            }
        } else {
            code += `    request.data = '${options.body}'.encode()\n`;
        }
    }

    code += `    ctx = ssl.create_default_context()
    try:
        response = urlopen(request, context=ctx)
    except HTTPError as e:
        response = e
        if response.code >= 400:
            raise
    return response\n`;

    return code;
}
