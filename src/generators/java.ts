import { RequestOptions } from "../request";

export function generateJavaCode(options: RequestOptions): string {
    let code = `import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        URL url = new URL("${options.url}");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("${options.method || 'GET'}");
        conn.setDoOutput(true);
        ${options.headers ? Object.entries(options.headers).map(([key, value]) => `conn.setRequestProperty("${key}", "${value}");`).join('\n') : ''}
        ${options.body ? `String input = "${options.body}";
        OutputStream os = conn.getOutputStream();
        os.write(input.getBytes());
        os.flush();` : ''}
        if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
            throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
        }
        conn.disconnect();
    }
}`;

    return code;
}