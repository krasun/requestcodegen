import { Request, queryValues } from "../request";
import { rubyString } from "../escape";

/** Ruby standard library (Net::HTTP). */
export function generateRubyCode(request: Request): string {
    let code = `require 'net/http'
require 'uri'

def send_request
  uri = URI.parse(${rubyString(request.url)})
`;

    if (request.query.length > 0) {
        code += `  query_params = {\n`;
        const entries = queryValues(request.query);
        entries.forEach(([key, value], index) => {
            const formatted = Array.isArray(value)
                ? `[${value.map(rubyString).join(", ")}]`
                : rubyString(value);
            code += `    ${rubyString(key)} => ${formatted}${index < entries.length - 1 ? "," : ""}\n`;
        });
        code += `  }\n`;
        code += `  uri.query = URI.encode_www_form(query_params)\n`;
    }

    code += `
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'

  request = Net::HTTPGenericRequest.new(${rubyString(request.method)}, ${request.body !== undefined ? "true" : "false"}, ${request.method.toUpperCase() === "HEAD" ? "false" : "true"}, uri.request_uri)
`;

    const headers = request.headers;
    for (const [key, value] of headers) {
        code += `  request[${rubyString(key)}] = ${rubyString(value)}\n`;
    }

    if (request.body !== undefined) {
        code += `  request.body = ${rubyString(request.body)}\n`;
    }

    code += `
  response = http.request(request)
end
`;

    return code;
}
