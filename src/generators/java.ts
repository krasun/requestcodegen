import { RequestOptions, JsonBody } from "../request";

export function generateJavaCode(options: RequestOptions): string {
    function formatHeaders(headers: any): string {
        if (!headers) return "";
        return Object.entries(headers)
            .map(([key, value]) => `        conn.setRequestProperty("${key}", "${value}");`)
            .join("\n");
    }

    function formatQueryParams(query: any): string {
        if (!query) return "";
        return Object.entries(query)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `        params.add("${key}", "${v}");`).join("\n");
                }
                return `        params.add("${key}", "${value}");`;
            })
            .join("\n");
    }

    function formatJsonBody(body: string | JsonBody): string {
        if (!body) return "";
        if (body instanceof JsonBody) {
            return JSON.stringify(body.body, null, 4)
                .split("\n")
                .map(line => "            " + line)
                .join("\n");
        }
        return body;
    }

    const code = `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        Map<String, String> params = new LinkedHashMap<>();
${formatQueryParams(options.query)}

        StringBuilder urlBuilder = new StringBuilder("${options.url}");
        if (!params.isEmpty()) {
            urlBuilder.append("?");
            boolean first = true;
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (!first) {
                    urlBuilder.append("&");
                }
                urlBuilder.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                urlBuilder.append("=");
                urlBuilder.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                first = false;
            }
        }

        HttpURLConnection conn = (HttpURLConnection) new URL(urlBuilder.toString()).openConnection();
        conn.setRequestMethod("${options.method || "GET"}");
${formatHeaders(options.headers)}
${options.body ? `
        conn.setDoOutput(true);
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = ${options.body instanceof JsonBody ? 
            `String.format(
${formatJsonBody(options.body)}
            ).getBytes("utf-8")` : 
            `"${options.body}".getBytes("utf-8")`};
            os.write(input, 0, input.length);
        }` : ""}

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                conn.getResponseCode() >= 400 ? conn.getErrorStream() : conn.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
        }
        conn.disconnect();
    }
}
`

    return code;
}