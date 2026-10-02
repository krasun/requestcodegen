import { invalidRequest } from "./errors";

/**
 * A plain, JSON-serializable HTTP request.
 */
export interface RequestOptions {
    /** An absolute http:// or https:// URL. It may contain a query and a fragment. */
    url: string;
    /** Defaults to GET. */
    method?: string;
    /** Appended to the URL query. Array values become repeated keys. */
    query?: Record<string, string | string[]>;
    headers?: Record<string, string>;
    /** UTF-8 text sent as is. An empty string is an empty body, undefined is no body. */
    body?: string;
    /** Whether HTTP redirects are followed. Omitted means the client default. */
    followRedirects?: boolean;
    /** Whether a compressed response is requested and decoded. Omitted means the client default. */
    compressed?: boolean;
}

export interface QueryEntry {
    key: string;
    values: string[];
    /** Whether the caller passed an array, so list syntax can be kept. */
    isArray: boolean;
}

/**
 * The validated request every generator works from, built by toRequest().
 */
export interface Request {
    method: string;
    /**
     * The URL without its fragment. When the URL already had a query, the
     * entries from `query` are appended to it here and `query` is empty, so
     * generators never have to merge two queries.
     */
    url: string;
    /** Query entries generators may render with their idiomatic params syntax. */
    query: QueryEntry[];
    /** The URL with every query entry encoded and appended. */
    fullUrl: string;
    headers: [string, string][];
    body?: string;
    followRedirects?: boolean;
    compressed?: boolean;
}

const TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
// Header values may contain tabs and visible characters, but no other controls.
const INVALID_HEADER_VALUE = /[\x00-\x08\x0a-\x1f\x7f]/;

export function isToken(value: string): boolean {
    return TOKEN.test(value);
}

export function validateHeader(name: string, value: string): void {
    if (!isToken(name)) {
        invalidRequest(`Header name ${JSON.stringify(name)} is not valid.`, "headers");
    }
    if (INVALID_HEADER_VALUE.test(value)) {
        invalidRequest(
            `Header ${name} contains a line break or another control character.`,
            "headers"
        );
    }
}

/**
 * Encodes query pairs as application/x-www-form-urlencoded, exactly like
 * URLSearchParams.toString() (spaces become "+").
 */
export function encodeQuery(pairs: [string, string][]): string {
    return new URLSearchParams(pairs).toString();
}

export function queryPairs(entries: QueryEntry[]): [string, string][] {
    const pairs: [string, string][] = [];
    for (const entry of entries) {
        for (const value of entry.values) {
            pairs.push([entry.key, value]);
        }
    }
    return pairs;
}

/** Query entries as [key, value] with array values kept as arrays. */
export function queryValues(entries: QueryEntry[]): [string, string | string[]][] {
    return entries.map(({ key, values, isArray }) => [key, isArray ? values : values[0]]);
}

export function appendQuery(url: string, encoded: string): string {
    if (!encoded) {
        return url;
    }
    if (!url.includes("?")) {
        return `${url}?${encoded}`;
    }
    if (url.endsWith("?") || url.endsWith("&")) {
        return url + encoded;
    }
    return `${url}&${encoded}`;
}

/**
 * Validates an absolute HTTP(S) URL and drops its fragment. The original
 * spelling is kept unless it contains characters that must be encoded
 * (spaces, non-ASCII), in which case the WHATWG serialization is used.
 */
export function prepareUrl(raw: unknown, field = "url"): string {
    if (typeof raw !== "string" || raw.trim() === "") {
        invalidRequest("The request URL is required.", field);
    }
    const trimmed = raw.trim();
    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return invalidRequest("The request URL is not a valid absolute URL.", field);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        invalidRequest("Only http:// and https:// URLs are supported.", field);
    }
    const hashIndex = trimmed.indexOf("#");
    const withoutFragment =
        hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex);
    if (/[^\x21-\x7e]/.test(withoutFragment)) {
        parsed.hash = "";
        return parsed.href;
    }
    return withoutFragment;
}

export function findHeader(
    headers: [string, string][],
    name: string
): string | undefined {
    const lower = name.toLowerCase();
    const found = headers.find(([key]) => key.toLowerCase() === lower);
    return found ? found[1] : undefined;
}

function readQuery(query: unknown): QueryEntry[] {
    if (query === undefined) {
        return [];
    }
    if (typeof query !== "object" || query === null || Array.isArray(query)) {
        invalidRequest("query must be an object.", "query");
    }
    const entries: QueryEntry[] = [];
    for (const [key, value] of Object.entries(query as object)) {
        if (typeof value === "string") {
            entries.push({ key, values: [value], isArray: false });
        } else if (
            Array.isArray(value) &&
            value.every((item) => typeof item === "string")
        ) {
            if (value.length > 0) {
                entries.push({ key, values: [...value], isArray: true });
            }
        } else {
            invalidRequest(
                `Query parameter ${JSON.stringify(key)} must be a string or an array of strings.`,
                "query"
            );
        }
    }
    return entries;
}

function readHeaders(headers: unknown): [string, string][] {
    if (headers === undefined) {
        return [];
    }
    if (
        typeof headers !== "object" ||
        headers === null ||
        Array.isArray(headers)
    ) {
        invalidRequest("headers must be an object.", "headers");
    }
    const seen = new Set<string>();
    const result: [string, string][] = [];
    for (const [name, value] of Object.entries(headers as object)) {
        if (typeof value !== "string") {
            invalidRequest(`Header ${name} must be a string.`, "headers");
        }
        validateHeader(name, value);
        const lower = name.toLowerCase();
        if (seen.has(lower)) {
            invalidRequest(
                `Header ${name} is set more than once with different letter case.`,
                "headers"
            );
        }
        seen.add(lower);
        result.push([name, value]);
    }
    return result;
}

/**
 * Validates request options and builds a Request without mutating them.
 */
export function toRequest(request: RequestOptions): Request {
    if (typeof request !== "object" || request === null) {
        invalidRequest("The request must be an object.");
    }

    let method = "GET";
    if (request.method !== undefined) {
        if (typeof request.method !== "string" || !isToken(request.method)) {
            invalidRequest("The HTTP method is not a valid token.", "method");
        }
        method = request.method;
    }

    for (const flag of ["followRedirects", "compressed"] as const) {
        if (request[flag] !== undefined && typeof request[flag] !== "boolean") {
            invalidRequest(`${flag} must be a boolean.`, flag);
        }
    }

    let url = prepareUrl(request.url);
    let query = readQuery(request.query);
    const headers = readHeaders(request.headers);

    if (request.body !== undefined && typeof request.body !== "string") {
        invalidRequest("body must be a string.", "body");
    }
    const body = request.body;

    const encoded = encodeQuery(queryPairs(query));
    const fullUrl = appendQuery(url, encoded);
    if (url.includes("?")) {
        url = fullUrl;
        query = [];
    }

    return {
        method,
        url,
        query,
        fullUrl,
        headers,
        body,
        followRedirects: request.followRedirects,
        compressed: request.compressed,
    };
}

/**
 * Returns the parsed value when the body is JSON that serializes back to the
 * exact same text, so a generator can show it as a literal without changing
 * the bytes that are sent.
 */
export function exactJson(body: string | undefined): { value: unknown } | undefined {
    if (body === undefined || body === "") {
        return undefined;
    }
    try {
        const value = JSON.parse(body);
        if (typeof value !== "object" || value === null) {
            return undefined;
        }
        if (JSON.stringify(value) !== body) {
            return undefined;
        }
        return { value };
    } catch {
        return undefined;
    }
}

export function isJsonContentType(contentType: string | undefined): boolean {
    if (!contentType) {
        return false;
    }
    const mediaType = contentType.split(";")[0].trim().toLowerCase();
    return mediaType === "application/json" || mediaType.endsWith("+json");
}

/** Methods for which clients send a body without being told explicitly. */
export function isBodylessMethod(method: string): boolean {
    const upper = method.toUpperCase();
    return upper === "GET" || upper === "HEAD";
}