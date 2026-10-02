import { Request, queryValues } from "../request";
import { pythonString } from "../escape";

/** Python standard library (urllib.request). */
export function generatePythonCode(request: Request): string {
    const imports = ["from urllib.request import Request, urlopen"];
    let code = `def call_api():\n    url = ${pythonString(request.url)}\n`;

    if (request.query.length > 0) {
        imports.unshift("from urllib.parse import urlencode");
        code += `    query_params = {\n`;
        for (const [key, value] of queryValues(request.query)) {
            const formatted = Array.isArray(value)
                ? `[${value.map(pythonString).join(", ")}]`
                : pythonString(value);
            code += `        ${pythonString(key)}: ${formatted},\n`;
        }
        code += `    }\n`;
        code += `    url = url + "?" + urlencode(query_params, doseq=True)\n`;
    }

    const data =
        request.body !== undefined ? `${pythonString(request.body)}.encode()` : "None";
    code += `    request = Request(url, data=${data}, method=${pythonString(request.method)})\n`;

    for (const [key, value] of request.headers) {
        code += `    request.add_header(${pythonString(key)}, ${pythonString(value)})\n`;
    }

    code += `    response = urlopen(request)\n`;
    code += `    return response\n`;

    return `${imports.join("\n")}\n\n${code}`;
}
