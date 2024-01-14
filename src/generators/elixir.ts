import { RequestOptions } from "../request";

export function generateElixirCode(options: RequestOptions): string {
    let code = `
    defmodule Example do
      require HTTPoison

      def request do
        headers = ${JSON.stringify(options.headers || {})}
        params = ${JSON.stringify(options.query || {})}
        body = ${options.body ? `"${options.body}"` : ""}
        method = :${(options.method || "GET").toLowerCase()}
        url = "${options.url}"

        case method do
          :get -> HTTPoison.get(url, headers, params: params)
          :post -> HTTPoison.post(url, body, headers, params: params)
          :put -> HTTPoison.put(url, body, headers, params: params)
          _ -> {:error, "Invalid method"}
        end
      end
    end
    `;

    return code;
}