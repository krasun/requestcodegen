import { RequestOptions, JsonBody } from "../request";

export function generateKotlinCode(options: RequestOptions): string {
    function formatHeaders(headers: any): string {
        if (!headers) return "";
        return Object.entries(headers)
            .map(([key, value]) => `        connection.setRequestProperty("${key}", "${value}")`)
            .join("\n");
    }

    function formatQueryParams(query: any): string {
        if (!query) return "";
        return Object.entries(query)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `        params["${key}"] = "${v}"`).join("\n");
                }
                return `        params["${key}"] = "${value}"`;
            })
            .join("\n");
    }

    function formatBody(body: string | JsonBody | undefined): string {
        if (!body) return "";
        if (body instanceof JsonBody) {
            return `        val requestBody = mapOf(
${Object.entries(body.body)
    .map(([key, value]) => `            "${key}" to "${value}"`)
    .join(",\n")}
        )
        val jsonBody = gson.toJson(requestBody)
        connection.setRequestProperty("Content-Type", "application/json")
        connection.outputStream.use { os ->
            os.write(jsonBody.toByteArray())
        }`;
        }
        return `        connection.outputStream.use { os ->
            os.write("""${body}""".toByteArray())
        }`;
    }

    const code = `import java.net.URL
import java.net.HttpURLConnection
import com.google.gson.Gson

fun makeRequest() {
    val gson = Gson()
    val params = mutableMapOf<String, String>()
${options.query ? formatQueryParams(options.query) : ""}
    val url = URL("${options.url}${options.query ? "?" + "\${params.entries.joinToString(\"&\") { \"\${it.key}=\${it.value}\" }}" : ""}")
    val connection = url.openConnection() as HttpURLConnection
    connection.requestMethod = "${options.method || "GET"}"
${formatHeaders(options.headers)}
${options.body ? formatBody(options.body) : ""}
    val response = connection.inputStream.bufferedReader().use { it.readText() }
    val responseCode = connection.responseCode
    if (responseCode != HttpURLConnection.HTTP_OK) {
        throw RuntimeException("HTTP error code: $responseCode")
    }
}`;

    return code;
}