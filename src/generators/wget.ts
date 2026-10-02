import { shellQuote } from "../escape";
import { Request } from "../request";

export function generateWgetCode(request: Request): string {
    const lines = ["wget"];

    if (request.method !== "GET" || request.body !== undefined) {
        lines.push(`--method=${shellQuote(request.method)}`);
    }
    if (request.body !== undefined) {
        lines.push(`--body-data=${shellQuote(request.body)}`);
    }
    for (const [name, value] of request.headers) {
        lines.push(`--header=${shellQuote(`${name}: ${value}`)}`);
    }
    lines.push(`-O -`);
    lines.push(shellQuote(request.fullUrl));

    return lines.join(" \\\n  ");
}
