import { shellQuote } from "../escape";
import { Request } from "../request";

export function generateCurlCode(request: Request): string {
    const { method, body } = request;
    const hasBody = body !== undefined;
    const url = request.fullUrl;

    const first = ["curl"];
    if (method === "HEAD" && !hasBody) {
        first.push("-I");
    } else if (!(method === "GET" && !hasBody) && !(method === "POST" && hasBody)) {
        first.push("-X", /^[A-Za-z0-9_-]+$/.test(method) ? method : shellQuote(method));
    }
    if (/[[\]{}]/.test(url)) {
        first.push("-g");
    }
    first.push(shellQuote(url));

    const lines = [first.join(" ")];
    for (const [name, value] of request.headers) {
        lines.push(`-H ${shellQuote(value === "" ? `${name};` : `${name}: ${value}`)}`);
    }
    if (hasBody) {
        lines.push(`${body.startsWith("@") ? "--data-raw" : "-d"} ${shellQuote(body)}`);
    }
    if (request.followRedirects) {
        lines.push("-L");
    }
    if (request.compressed) {
        lines.push("--compressed");
    }

    return lines.join(" \\\n  ");
}
