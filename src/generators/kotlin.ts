import { Request, queryPairs } from "../request";
import { unsupportedTarget } from "../errors";
import { kotlinString } from "../escape";

// HttpURLConnection silently drops these unless restricted headers are allowed.
const RESTRICTED_HEADERS = new Set([
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "content-transfer-encoding",
    "host",
    "keep-alive",
    "origin",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "via",
]);

const URL_CONNECTION_METHODS = new Set([
    "GET",
    "POST",
    "HEAD",
    "OPTIONS",
    "PUT",
    "DELETE",
    "TRACE",
]);

export function generateKotlinCode(request: Request): string {
    if (!URL_CONNECTION_METHODS.has(request.method)) {
        unsupportedTarget(
            "Kotlin",
            `HttpURLConnection does not support the ${request.method} method.`,
            "method"
        );
    }

    const lines: string[] = [];
    if (request.headers.map(([name]) => name).some((name) => RESTRICTED_HEADERS.has(name.toLowerCase()))) {
        lines.push(`System.setProperty("sun.net.http.allowRestrictedHeaders", "true")`);
    }
    if (request.query.length > 0) {
        lines.push(`val params = listOf(`);
        for (const [key, value] of queryPairs(request.query)) {
            lines.push(`    ${kotlinString(key)} to ${kotlinString(value)},`);
        }
        lines.push(`)`);
        lines.push(
            `val query = params.joinToString("&") { (key, value) -> URLEncoder.encode(key, "UTF-8") + "=" + URLEncoder.encode(value, "UTF-8") }`
        );
        lines.push(`val url = URL(${kotlinString(request.url + "?")} + query)`);
    } else {
        lines.push(`val url = URL(${kotlinString(request.url)})`);
    }

    lines.push(`val connection = url.openConnection() as HttpURLConnection`);
    lines.push(`connection.requestMethod = ${kotlinString(request.method)}`);
    for (const [key, value] of request.headers) {
        lines.push(`connection.setRequestProperty(${kotlinString(key)}, ${kotlinString(value)})`);
    }

    if (request.body !== undefined) {
        lines.push(`connection.doOutput = true`);
        lines.push(`connection.outputStream.use { os ->`);
        lines.push(`    os.write(${kotlinString(request.body)}.toByteArray(Charsets.UTF_8))`);
        lines.push(`}`);
    }

    lines.push(
        `val response = (if (connection.responseCode >= 400) connection.errorStream else connection.inputStream)?.bufferedReader()?.use { it.readText() }`
    );

    return `import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

fun makeRequest() {
${lines.map((line) => `    ${line}`).join("\n")}
}`;
}
