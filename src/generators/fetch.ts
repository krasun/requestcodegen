import { unsupportedTarget } from "../errors";
import { jsString } from "../escape";
import { findHeader, isBodylessMethod, Request } from "../request";
import {
    exactJsonBody,
    formatLiteral,
    headersForCompression,
    LiteralSyntax,
    requireAsciiHeaders,
} from "./common";

export const JAVASCRIPT: LiteralSyntax = {
    string: jsString,
    key: (key) =>
        key === "__proto__"
            ? `[${jsString(key)}]`
            : /^[A-Za-z_$][\w$]*$/.test(key)
              ? key
              : jsString(key),
    null: "null",
    true: "true",
    false: "false",
    array: ["[", "]"],
    object: ["{", "}"],
    pair: ": ",
};

// Headers a browser does not let fetch() set (Fetch standard, forbidden request-headers).
const BROWSER_FORBIDDEN = new Set([
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "date",
    "dnt",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "set-cookie",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "via",
]);

// Headers Node.js fetch (undici) rejects.
const NODE_FORBIDDEN = new Set([
    "keep-alive",
    "transfer-encoding",
    "upgrade",
    "expect",
]);

function isBrowserForbidden(name: string): boolean {
    const lower = name.toLowerCase();
    return (
        BROWSER_FORBIDDEN.has(lower) ||
        lower.startsWith("proxy-") ||
        lower.startsWith("sec-")
    );
}

/**
 * Renders query entries as URLSearchParams: an object, or a list of pairs
 * when a key repeats.
 */
export function urlSearchParamsLiteral(request: Request): string {
    if (request.query.some((entry) => entry.isArray)) {
        const pairs = request.query.flatMap(({ key, values }) =>
            values.map((value) => `    [${jsString(key)}, ${jsString(value)}],`)
        );
        return `new URLSearchParams([\n${pairs.join("\n")}\n])`;
    }
    const entries = request.query.map(
        ({ key, values }) => `    ${JAVASCRIPT.key(key)}: ${jsString(values[0])},`
    );
    return `new URLSearchParams({\n${entries.join("\n")}\n})`;
}

export function jsBodyExpression(request: Request): string | undefined {
    if (request.body === undefined) {
        return undefined;
    }
    const literal = exactJsonBody(request);
    if (literal) {
        return `JSON.stringify(${formatLiteral(literal.value, JAVASCRIPT, 1)})`;
    }
    return jsString(request.body);
}

export function generateFetchCode(
    request: Request,
    runtime: "browser" | "node"
): string {
    const target = runtime === "browser" ? "JavaScript" : "Node (Fetch)";

    if (/^https?:\/\/[^/?#]*@/i.test(request.url)) {
        unsupportedTarget(target, "fetch() does not accept credentials in the URL.", "url");
    }
    if (request.body !== undefined && isBodylessMethod(request.method)) {
        unsupportedTarget(
            target,
            `fetch() cannot send a body with ${request.method.toUpperCase()}.`,
            "body"
        );
    }

    // fetch() always derives Host from the URL.
    const host = findHeader(request.headers, "Host");
    if (host !== undefined && host.toLowerCase() !== new URL(request.url).host) {
        unsupportedTarget(target, "fetch() cannot send a Host header that differs from the URL.", "headers");
    }
    let headers = request.headers.filter(([name]) => name.toLowerCase() !== "host");
    let includeCredentials = false;
    if (runtime === "browser") {
        if (request.compressed === false) {
            unsupportedTarget(
                target,
                "browsers always negotiate compression, so compressed: false is not supported.",
                "compressed"
            );
        }
        includeCredentials = headers.some(
            ([name]) => name.toLowerCase() === "cookie"
        );
        headers = headers.filter(([name]) => !isBrowserForbidden(name));
    } else {
        const rejected = headers.find(([name]) =>
            NODE_FORBIDDEN.has(name.toLowerCase())
        );
        if (rejected) {
            unsupportedTarget(target, `fetch() does not allow the ${rejected[0]} header.`, "headers");
        }
        headers = headersForCompression({ ...request, headers });
    }

    requireAsciiHeaders(target, headers);

    const blocks: string[] = [];
    let urlExpression = jsString(request.url);
    if (request.query.length > 0) {
        blocks.push(`const params = ${urlSearchParamsLiteral(request)};`);
        urlExpression = `${jsString(request.url + "?")} + params`;
    }

    const options: string[] = [];
    if (request.method !== "GET") {
        options.push(`method: ${jsString(request.method)},`);
    }
    if (headers.length > 0) {
        const lines = headers.map(
            ([name, value]) => `        ${jsString(name)}: ${jsString(value)},`
        );
        options.push(`headers: {\n${lines.join("\n")}\n    },`);
    }
    const body = jsBodyExpression(request);
    if (body !== undefined) {
        options.push(`body: ${body},`);
    }
    if (request.followRedirects === false) {
        options.push(`redirect: "manual",`);
    }
    if (includeCredentials) {
        options.push(`credentials: "include",`);
    }

    const call =
        options.length > 0
            ? `await fetch(${urlExpression}, {\n${options.map((o) => `    ${o}`).join("\n")}\n});`
            : `await fetch(${urlExpression});`;
    blocks.push(`const response = ${call}`);

    return blocks.join("\n\n");
}
