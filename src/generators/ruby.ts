import { RequestOptions, JsonBody } from "../request";

export function generateRubyCode(options: RequestOptions): string {
    let code = `require 'net/http'
require 'uri'
require 'json'

def send_request
  uri = URI.parse("${options.url}")
`;

    if (options.query) {
        code += `  query_params = {\n`;
        Object.entries(options.query).forEach(([key, value], index, array) => {
            code += `    "${key}" => ${value}${index < array.length - 1 ? ',' : ''}\n`;
        });
        code += `  }\n`;
        code += `  uri.query = URI.encode_www_form(query_params)\n\n`;
    }

    code += `  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'\n\n`;

    const method = options.method || "GET";
    const methodFormatted = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    code += `  request = Net::HTTP::${methodFormatted}.new(uri.request_uri)\n`;

    if (options.headers) {
        code += `\n  request.initialize_http_header(\n`;
        Object.entries(options.headers).forEach(([key, value], index, array) => {
            code += `    "${key}" => "${value}"${index < array.length - 1 ? ',' : ''}\n`;
        });
        code += `  )\n`;
    }

    if (options.body) {
        code += `\n`;
        if (options.body instanceof JsonBody) {
            code += `  body = {\n`;
            Object.entries(options.body.body).forEach(([key, value], index, array) => {
                code += `    "${key}" => ${JSON.stringify(value)}${index < array.length - 1 ? ',' : ''}\n`;
            });
            code += `  }\n`;
            code += `  request.body = body.to_json\n`;
        } else {
            code += `  request.body = '${options.body}'\n`;
        }
    }

    code += `\n  begin
    response = http.request(request)
    case response
    when Net::HTTPSuccess
      response
    else
      raise "HTTP Error: #{response.code} - #{response.message}"
    end
  rescue StandardError => e
    raise "Request failed: #{e.message}"
  end
end

send_request if __FILE__ == $PROGRAM_NAME\n`;

    return code;
}
