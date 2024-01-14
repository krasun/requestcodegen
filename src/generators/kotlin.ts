import { RequestOptions } from "../request";

export function generateKotlinCode(options: RequestOptions): string {
    let code = `
    import java.net.URL
    import java.net.HttpURLConnection
    import java.io.OutputStreamWriter

    fun makeRequest() {
        val url = URL("${options.url}")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "${options.method || 'GET'}"
${options.headers ? Object.entries(options.headers).map(([key, value]) => `connection.setRequestProperty("${key}", "${value}")`).join('\n') : ''}
${options.body ? `        val out = OutputStreamWriter(connection.outputStream)
        out.write("${options.body}")
        out.close()` : ''}
        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw RuntimeException("HTTP error code: $responseCode")
        }
    }
    `;

    return code;
}