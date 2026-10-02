import { invalidInput, ParseError, unsupportedInput } from "../errors";
import { isToken, toRequest, prepareUrl, validateHeader } from "../request";
import { RequestOptions } from "../request";

const REQUEST_LINE = /^([^\s]+) ([^\s]+)(?: HTTP\/(\d(?:\.\d)?))?$/;
const SUPPORTED_VERSIONS = new Set(["1.0", "1.1", "2", "2.0", "3"]);
const BINARY = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;

function defaultPort(protocol: string): string {
    return protocol === "https:" ? "443" : "80";
}

function sameHost(host: string, url: URL): boolean {
    let parsed: URL;
    try {
        parsed = new URL(`${url.protocol}//${host}`);
    } catch {
        return invalidInput("The Host header is not valid.", "Host");
    }
    const port = (u: URL) => u.port || defaultPort(u.protocol);
    return parsed.hostname === url.hostname && port(parsed) === port(url);
}

/**
 * Parses raw HTTP/1.x request text, for example copied from browser
 * developer tools. An origin-form target such as "/items?limit=10" is
 * resolved against `baseUrl`, or against https://<Host> when no base URL is
 * given.
 */
export function parseHttpRequest(input: string, baseUrl?: string): RequestOptions {
    if (typeof input !== "string") {
        invalidInput("The HTTP request must be a string.");
    }

    const text = input.replace(/^(\r?\n)+/, "");
    const separator = text.match(/\r?\n\r?\n/);
    const head = separator ? text.slice(0, separator.index) : text.replace(/(\r?\n)+$/, "");
    const rawBody = separator ? text.slice(separator.index! + separator[0].length) : undefined;

    if (BINARY.test(head) || (rawBody !== undefined && BINARY.test(rawBody))) {
        unsupportedInput("Binary HTTP requests are not supported.");
    }

    const lines = head.split(/\r?\n/);
    const requestLine = lines[0].match(REQUEST_LINE);
    if (!requestLine) {
        invalidInput(
            'The first line must look like "GET /path HTTP/1.1".',
            "request-line"
        );
    }
    const [, method, target, version] = requestLine;
    if (version !== undefined && !SUPPORTED_VERSIONS.has(version)) {
        unsupportedInput(`HTTP/${version} is not supported.`, "request-line");
    }
    if (!isToken(method)) {
        invalidInput("The HTTP method is not a valid token.", "method");
    }

    const headers: [string, string][] = [];
    for (const line of lines.slice(1)) {
        if (/^[ \t]/.test(line)) {
            unsupportedInput("Folded header lines are not supported.", "headers");
        }
        if (line.startsWith(":")) {
            unsupportedInput("HTTP/2 pseudo-headers are not supported.", "headers");
        }
        const colon = line.indexOf(":");
        if (colon <= 0) {
            invalidInput('Every header line must look like "Name: value".', "headers");
        }
        const name = line.slice(0, colon);
        const value = line.slice(colon + 1).trim();
        validateHeader(name, value);
        const existing = headers.find(
            ([key]) => key.toLowerCase() === name.toLowerCase()
        );
        if (existing) {
            existing[1] += (name.toLowerCase() === "cookie" ? "; " : ", ") + value;
        } else {
            headers.push([name, value]);
        }
    }

    const take = (name: string): string | undefined => {
        const index = headers.findIndex(
            ([key]) => key.toLowerCase() === name.toLowerCase()
        );
        if (index === -1) {
            return undefined;
        }
        return headers.splice(index, 1)[0][1];
    };
    const host = take("Host");
    const contentLength = take("Content-Length");
    const transferEncoding = headers.find(
        ([key]) => key.toLowerCase() === "transfer-encoding"
    );
    if (transferEncoding) {
        unsupportedInput(
            "Transfer-Encoding bodies (for example chunked) are not supported.",
            "Transfer-Encoding"
        );
    }

    let url: string;
    if (target === "*") {
        unsupportedInput('The "*" request target is not supported.', "target");
    }
    if (/^https?:\/\//i.test(target)) {
        url = prepareUrl(target, "target");
    } else if (target.startsWith("/")) {
        let origin: string;
        if (baseUrl !== undefined) {
            origin = new URL(prepareUrl(baseUrl, "baseUrl")).origin;
        } else if (host !== undefined) {
            origin = new URL(prepareUrl(`https://${host}`, "Host")).origin;
        } else {
            throw new ParseError(
                "BASE_URL_REQUIRED",
                "The request target is a path and there is no Host header. Pass a base URL.",
                "baseUrl"
            );
        }
        // Concatenate instead of resolving, so "//other.host" stays a path.
        url = prepareUrl(origin + target, "target");
    } else if (method.toUpperCase() === "CONNECT") {
        return unsupportedInput("CONNECT requests are not supported.", "target");
    } else {
        return invalidInput("The request target must be a path or an absolute URL.", "target");
    }

    if (host !== undefined && !sameHost(host, new URL(url))) {
        invalidInput("The Host header does not match the request URL.", "Host");
    }

    let body: string | undefined;
    if (rawBody !== undefined && rawBody !== "") {
        body = rawBody;
    } else if (contentLength !== undefined) {
        if (!/^\d+$/.test(contentLength.trim())) {
            invalidInput("Content-Length is not a number.", "Content-Length");
        }
        if (Number(contentLength) === 0) {
            body = "";
        }
    }

    const request: RequestOptions = { url, method };
    if (headers.length > 0) {
        request.headers = Object.fromEntries(headers);
    }
    if (body !== undefined) {
        request.body = body;
    }

    toRequest(request);

    return request;
}
