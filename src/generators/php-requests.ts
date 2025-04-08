import { RequestOptions, JsonBody } from "../request";

export function generatePHPRequestsCode(options: RequestOptions): string {
    const formatObject = (obj: any): string => {
        if (!obj || Object.keys(obj).length === 0) {
            return '[]';
        }
        const entries = Object.entries(obj).map(([key, value]) => 
            `    '${key}' => ${typeof value === 'string' ? `'${value}'` : JSON.stringify(value)}`
        ).join(",\n");
        return `[\n${entries}\n]`;
    };

    let code = `<?php\n`;
    code += `require 'vendor/autoload.php';\n\n`;
    code += `$url = '${options.url}';\n`;
    code += `$method = '${options.method || "GET"}';\n`;
    code += `$headers = ${formatObject(options.headers)};\n`;
    code += `$query = ${formatObject(options.query)};\n`;
    
    if (options.body) {
        if (options.body instanceof JsonBody) {
            code += `$body = ${formatObject(options.body.body)};\n`;
        } else if (typeof options.body === 'string') {
            try {
                const bodyObj = JSON.parse(options.body);
                code += `$body = ${formatObject(bodyObj)};\n`;
            } catch {
                code += `$body = '${options.body}';\n`;
            }
        }
    } else {
        code += `$body = [];\n`;
    }
    
    code += `\n$response = Requests::request($url, $headers, $body, $method, $query);\n`;
    code += `if ($response->status_code >= 400) {\n`;
    code += `    throw new Exception('Server responded with status code ' . $response->status_code);\n`;
    code += `}\n`;
    code += `?>`
    return code;
}
