import { pythonString } from "../escape";
import { Request } from "../request";
import { formatLiteral, headersForCompression, LiteralSyntax } from "./common";

const PYTHON: LiteralSyntax = {
    string: pythonString,
    key: pythonString,
    null: "None",
    true: "True",
    false: "False",
    array: ["[", "]"],
    object: ["{", "}"],
    pair: ": ",
};

const SHORTCUTS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

/** http.client encodes str as Latin-1, so non-ASCII text is passed as UTF-8 bytes. */
function pythonText(value: string): string {
    return /[^\x00-\x7f]/.test(value)
        ? `${pythonString(value)}.encode()`
        : pythonString(value);
}

export function generatePythonRequestsCode(request: Request): string {
    const blocks: string[] = [];
    const args: string[] = [pythonString(request.url)];

    if (request.query.length > 0) {
        const params = request.query.map(
            ({ key, values, isArray }) =>
                `    ${pythonString(key)}: ${formatLiteral(isArray ? values : values[0], PYTHON, 1)},`
        );
        blocks.push(`params = {\n${params.join("\n")}\n}`);
        args.push("params=params");
    }

    const headers = headersForCompression(request);
    if (headers.length > 0) {
        const lines = headers.map(
            ([name, value]) => `    ${pythonString(name)}: ${pythonText(value)},`
        );
        blocks.push(`headers = {\n${lines.join("\n")}\n}`);
        args.push("headers=headers");
    }

    if (request.body !== undefined) {
        blocks.push(`data = ${pythonText(request.body)}`);
        args.push("data=data");
    }

    const method = request.method.toLowerCase();
    const followsByDefault = method !== "head";
    if (
        request.followRedirects !== undefined &&
        request.followRedirects !== followsByDefault
    ) {
        args.push(`allow_redirects=${request.followRedirects ? "True" : "False"}`);
    }

    // Requests always sends the method in upper case.
    const shortcut = SHORTCUTS.has(method);
    const fn = shortcut ? `requests.${method}` : "requests.request";
    const callArgs = shortcut
        ? args
        : [pythonString(request.method.toUpperCase()), ...args];
    const invocation =
        callArgs.length === 1
            ? `${fn}(${callArgs[0]})`
            : `${fn}(\n${callArgs.map((arg) => `    ${arg},`).join("\n")}\n)`;

    return ["import requests", ...blocks, `response = ${invocation}`].join("\n\n");
}
