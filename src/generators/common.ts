import { unsupportedTarget } from "../errors";
import {
    exactJson,
    findHeader,
    isJsonContentType,
    Request,
} from "../request";

/**
 * The flag defaults of an HTTP client. `undefined` means the behavior is not
 * verified, so any explicit value is rejected.
 */
export interface ClientDefaults {
    followRedirects?: boolean;
    compressed?: boolean;
}

/**
 * Rejects explicit followRedirects/compressed values that a generator cannot
 * express because it only produces the client's default behavior.
 */
export function requireDefaultFlags(
    target: string,
    request: Request,
    defaults: ClientDefaults
): void {
    if (
        request.followRedirects !== undefined &&
        request.followRedirects !== defaults.followRedirects
    ) {
        unsupportedTarget(
            target,
            `followRedirects: ${request.followRedirects} is not supported.`,
            "followRedirects"
        );
    }
    if (
        request.compressed !== undefined &&
        request.compressed !== defaults.compressed
    ) {
        unsupportedTarget(
            target,
            `compressed: ${request.compressed} is not supported.`,
            "compressed"
        );
    }
}

/**
 * For clients that ask for compressed responses by default, compressed: false
 * is expressed by asking for an uncompressed response.
 */
export function headersForCompression(
    request: Request
): [string, string][] {
    if (
        request.compressed === false &&
        findHeader(request.headers, "Accept-Encoding") === undefined
    ) {
        return [...request.headers, ["Accept-Encoding", "identity"]];
    }
    return request.headers;
}

/**
 * For a JSON content type, the parsed body when JSON.stringify() reproduces
 * the exact same text, so it can be shown as a literal without changing the
 * bytes that are sent.
 */
export function exactJsonBody(request: Request): { value: unknown } | undefined {
    return isJsonContentType(findHeader(request.headers, "Content-Type"))
        ? exactJson(request.body)
        : undefined;
}

/** Formats JSON-compatible data with a per-language scalar and key syntax. */
export interface LiteralSyntax {
    string: (value: string) => string;
    key: (key: string) => string;
    null: string;
    true: string;
    false: string;
    array: [string, string];
    object: [string, string];
    pair: string;
}

export function formatLiteral(
    value: unknown,
    syntax: LiteralSyntax,
    level = 0,
    indentSize = 4
): string {
    const pad = " ".repeat((level + 1) * indentSize);
    const closePad = " ".repeat(level * indentSize);
    if (value === null || value === undefined) {
        return syntax.null;
    }
    if (typeof value === "boolean") {
        return value ? syntax.true : syntax.false;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? String(value) : syntax.null;
    }
    if (typeof value === "string") {
        return syntax.string(value);
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return syntax.array.join("");
        }
        if (value.every((item) => item === null || typeof item !== "object")) {
            const inline = value.map((item) => formatLiteral(item, syntax)).join(", ");
            if (inline.length <= 60 && !inline.includes("\n")) {
                return `${syntax.array[0]}${inline}${syntax.array[1]}`;
            }
        }
        const items = value.map(
            (item) => `${pad}${formatLiteral(item, syntax, level + 1, indentSize)},`
        );
        return `${syntax.array[0]}\n${items.join("\n")}\n${closePad}${syntax.array[1]}`;
    }
    const entries = Object.entries(value as object).filter(
        ([, item]) => item !== undefined && typeof item !== "function"
    );
    if (entries.length === 0) {
        return syntax.object.join("");
    }
    const items = entries.map(
        ([key, item]) =>
            `${pad}${syntax.key(key)}${syntax.pair}${formatLiteral(item, syntax, level + 1, indentSize)},`
    );
    return `${syntax.object[0]}\n${items.join("\n")}\n${closePad}${syntax.object[1]}`;
}

/**
 * fetch() and Node.js send header values as Latin-1 bytes, so non-ASCII text
 * would not arrive as the UTF-8 curl sends.
 */
export function requireAsciiHeaders(target: string, headers: [string, string][]): void {
    const header = headers.find(([, value]) => /[^\x00-\x7f]/.test(value));
    if (header) {
        unsupportedTarget(
            target,
            `the ${header[0]} header contains non-ASCII text, which this client cannot send as UTF-8.`,
            "headers"
        );
    }
}
