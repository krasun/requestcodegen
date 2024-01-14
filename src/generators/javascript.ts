import { RequestOptions } from "../request";

export function generateJavaScriptCode(options: RequestOptions): string {
    let code = `fetch('${options.url}`;

    if (options.query) {
        const query = Object.entries(options.query)
            .map(
                ([key, value]) =>
                    `${key}=${encodeURIComponent(value as string)}`
            )
            .join("&");
        code += `?${query}'`;
    } else {
        code += `'`;
    }

    code += ", {\n";

    if (options.method) {
        code += `method: '${options.method}',\n`;
    }

    if (options.headers) {
        const headers = Object.entries(options.headers)
            .map(([key, value]) => `'${key}': '${value}'`)
            .join(",\n");
        code += `headers: {\n${headers}\n},\n`;
    }

    if (options.body) {
        code += `body: '${options.body}',\n`;
    }

    code += "})\n.catch(error => console.error('Error:', error));";

    return code;
}
