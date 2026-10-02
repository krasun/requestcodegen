import { Request, queryPairs } from "../request";
import { unsupportedTarget } from "../errors";
import { javaString } from "../escape";

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

export function generateJavaCode(request: Request): string {
    if (!URL_CONNECTION_METHODS.has(request.method)) {
        unsupportedTarget(
            "Java",
            `HttpURLConnection does not support the ${request.method} method.`,
            "method"
        );
    }

    const lines: string[] = [];
    if (request.headers.map(([name]) => name).some((name) => RESTRICTED_HEADERS.has(name.toLowerCase()))) {
        lines.push(`System.setProperty("sun.net.http.allowRestrictedHeaders", "true");`);
    }
    if (request.query.length > 0) {
        lines.push(`List<String[]> params = new ArrayList<>();`);
        for (const [key, value] of queryPairs(request.query)) {
            lines.push(`params.add(new String[] {${javaString(key)}, ${javaString(value)}});`);
        }
        lines.push(``);
        lines.push(`StringJoiner query = new StringJoiner("&");`);
        lines.push(`for (String[] param : params) {`);
        lines.push(
            `    query.add(URLEncoder.encode(param[0], StandardCharsets.UTF_8) + "=" + URLEncoder.encode(param[1], StandardCharsets.UTF_8));`
        );
        lines.push(`}`);
        lines.push(``);
        lines.push(`URL url = new URL(${javaString(request.url + "?")} + query);`);
    } else {
        lines.push(`URL url = new URL(${javaString(request.url)});`);
    }

    lines.push(`HttpURLConnection conn = (HttpURLConnection) url.openConnection();`);
    lines.push(`conn.setRequestMethod(${javaString(request.method)});`);
    for (const [key, value] of request.headers) {
        lines.push(`conn.setRequestProperty(${javaString(key)}, ${javaString(value)});`);
    }

    if (request.body !== undefined) {
        lines.push(``);
        lines.push(`conn.setDoOutput(true);`);
        lines.push(`try (OutputStream os = conn.getOutputStream()) {`);
        lines.push(`    os.write(${javaString(request.body)}.getBytes(StandardCharsets.UTF_8));`);
        lines.push(`}`);
    }

    lines.push(``);
    lines.push(`int responseCode = conn.getResponseCode();`);
    lines.push(
        `InputStream response = responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream();`
    );

    return `import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

public class Main {
    public static void main(String[] args) throws Exception {
${lines.map((line) => (line ? `        ${line}` : "")).join("\n")}
    }
}
`;
}
