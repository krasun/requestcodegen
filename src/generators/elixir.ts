import { Request, queryPairs } from "../request";
import { elixirString } from "../escape";

function tupleList(pairs: [string, string][]): string {
    if (pairs.length === 0) {
        return "[]";
    }
    return `[\n${pairs
        .map(([key, value]) => `      {${elixirString(key)}, ${elixirString(value)}}`)
        .join(",\n")}\n    ]`;
}

export function generateElixirCode(request: Request): string {
    const method = /^[A-Za-z0-9_]+$/.test(request.method)
        ? `:${request.method.toLowerCase()}`
        : elixirString(request.method);
    const headers = tupleList(request.headers);
    const params = tupleList(request.query.length > 0 ? queryPairs(request.query) : []);
    const body = request.body !== undefined ? elixirString(request.body) : `""`;

    return `defmodule Example do
  def request do
    url = ${elixirString(request.url)}
    headers = ${headers}
    params = ${params}
    body = ${body}

    response = HTTPoison.request!(${method}, url, body, headers, params: params)
  end
end`;
}
