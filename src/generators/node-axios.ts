import { jsString } from "../escape";
import { findHeader, isJsonContentType, Request } from "../request";
import {
    exactJsonBody,
    formatLiteral,
    headersForCompression,
    requireAsciiHeaders,
} from "./common";
import { JAVASCRIPT } from "./fetch";

/** Axios in Node.js as an ES module with top-level await. */
export function generateNodeAxiosCode(request: Request): string {
    const config: string[] = [];
    if (request.method !== "GET") {
        config.push(`method: ${jsString(request.method)},`);
    }
    config.push(`url: ${jsString(request.url)},`);

    if (request.query.length > 0) {
        const params = request.query.map(
            ({ key, values, isArray }) =>
                `        ${JAVASCRIPT.key(key)}: ${formatLiteral(isArray ? values : values[0], JAVASCRIPT, 2)},`
        );
        config.push(`params: {\n${params.join("\n")}\n    },`);
        if (request.query.some((entry) => entry.isArray)) {
            // Repeat keys (a=1&a=2) instead of the default a[]=1&a[]=2.
            config.push(`paramsSerializer: {\n        indexes: null,\n    },`);
        }
    }

    const headers = headersForCompression(request);
    requireAsciiHeaders("Node (Axios)", headers);
    if (headers.length > 0) {
        const lines = headers.map(
            ([name, value]) => `        ${jsString(name)}: ${jsString(value)},`
        );
        config.push(`headers: {\n${lines.join("\n")}\n    },`);
    }

    if (request.body !== undefined) {
        const literal = exactJsonBody(request);
        if (literal) {
            config.push(`data: ${formatLiteral(literal.value, JAVASCRIPT, 1)},`);
        } else {
            config.push(`data: ${jsString(request.body)},`);
            if (isJsonContentType(findHeader(request.headers, "Content-Type"))) {
                // Axios re-serializes string data sent as JSON; send it unchanged.
                config.push(`transformRequest: [(data) => data],`);
            }
        }
    }

    if (request.followRedirects === false) {
        config.push(`maxRedirects: 0,`);
    }

    return `import axios from "axios";

const response = await axios({
${config.map((line) => `    ${line}`).join("\n")}
});`;
}
