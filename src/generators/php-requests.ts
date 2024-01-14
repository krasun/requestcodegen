import { RequestOptions } from "../request";

export function generatePHPRequestsCode(options: RequestOptions): string {
    let code = `<?php\n`;
    code += `require 'vendor/autoload.php';\n`;
    code += `$headers = ${JSON.stringify(options.headers || {})};\n`;
    code += `$query = ${JSON.stringify(options.query || {})};\n`;
    code += `$body = ${options.body || '""'};\n`;
    code += `$method = '${options.method || "GET"}';\n`;
    code += `$url = '${options.url}';\n`;
    code += `\n`;
    code += `$response = Requests::request($url, $headers, $body, $method, $query);\n`;
    code += `if ($response->status_code >= 400) {\n`;
    code += `    throw new Exception('Server responded with status code ' . $response->status_code);\n`;
    code += `}\n`;
    code += `?>`;
    return code;
}
