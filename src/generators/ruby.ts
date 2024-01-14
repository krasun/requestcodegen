import { RequestOptions } from "../request";

export function generateRubyCode(options: RequestOptions): string {
    let code = `require 'net/http'\nrequire 'uri'\nrequire 'json'\n\n`;

    code += `uri = URI.parse("${options.url}")\n`;

    if (options.query) {
        const queryParams = Object.entries(options.query)
            .map(([key, value]) => `${key}=#{${value}}`)
            .join("&");
        code += `uri.query = "${queryParams}"\n`;
    }

    code += `http = Net::HTTP.new(uri.host, uri.port)\n`;
    code += `request = Net::HTTP::${
        options.method || "Get"
    }.new(uri.request_uri)\n`;

    if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
            code += `request["${key}"] = "${value}"\n`;
        }
    }

    if (options.body) {
        code += `request.body = '${options.body}'\n`;
    }

    code += `response = http.request(request)\n`;
    code += `if response.code.to_i >= 400\n`;
    code += `  raise "HTTP Error: #{response.code}"\n`;
    code += `end\n`;

    return code;
}
