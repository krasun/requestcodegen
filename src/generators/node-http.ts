import { Request, queryPairs } from "../request";
import { jsString } from "../escape";

export function generateNodeHTTPCode(request: Request): string {
    const isHttps = new URL(request.url).protocol === "https:";
    const module = isHttps ? "https" : "http";
    const lines: string[] = [];

    lines.push(`const ${module} = require(${jsString(module)});`);
    lines.push(``);
    lines.push(`const url = new URL(${jsString(request.url)});`);
    if (request.query.length > 0) {
        for (const [key, value] of queryPairs(request.query)) {
            lines.push(`url.searchParams.append(${jsString(key)}, ${jsString(value)});`);
        }
    }
    if (request.body !== undefined) {
        lines.push(``);
        lines.push(`const body = ${jsString(request.body)};`);
    }

    const headers = request.headers;
    lines.push(``);
    lines.push(`const options = {`);
    lines.push(`    method: ${jsString(request.method)},`);
    if (headers.length > 0) {
        lines.push(`    headers: {`);
        for (const [key, value] of headers) {
            lines.push(`        ${jsString(key)}: ${jsString(value)},`);
        }
        lines.push(`    },`);
    }
    lines.push(`};`);

    lines.push(``);
    lines.push(`const req = ${module}.request(url, options, (response) => {`);
    lines.push(`    response.resume();`);
    lines.push(`});`);
    lines.push(``);
    lines.push(`req.on("error", (error) => {`);
    lines.push(`    console.error(error);`);
    lines.push(`});`);
    if (request.body !== undefined) {
        lines.push(``);
        lines.push(`req.write(body);`);
    }
    lines.push(`req.end();`);

    return lines.join("\n");
}
