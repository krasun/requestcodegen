import { JsonBody, RequestOptions } from "../request";

export function generateElixirCode(options: RequestOptions): string {
    function formatMap(obj: any): string {
        if (!obj || Object.keys(obj).length === 0) return "%{}";
        
        const entries = Object.entries(obj).map(([key, value]) => {
            if (Array.isArray(value)) {
                return `    "${key}": ${JSON.stringify(value)}`;
            }
            if (typeof value === 'object' && value !== null) {
                return `    "${key}": ${JSON.stringify(value)}`;
            }
            return `    "${key}": "${value}"`;
        });
        
        return "%{\n" + entries.join(",\n") + "\n  }";
    }

    function formatBody(body: any): string {
        if (!body) return "nil";

        if (body instanceof JsonBody) {
            return formatMap(body.body);
        }

        return `"${body}"`;
    }

    const method = (options.method || "GET").toLowerCase();
    const headers = formatMap(options.headers || {});
    const params = formatMap(options.query || {});
    const body = formatBody(options.body);

    const code = `defmodule Example do
  use HTTPoison.Base

  def request do
    url = "${options.url}"
    headers = ${headers}
    params = ${params}
    body = ${body}

    response = HTTPoison.${method}!(url${body !== "nil" ? ", body" : ""}, headers, params: params)
  end
end`;

    return code;
}
