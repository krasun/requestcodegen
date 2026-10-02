import { Request, queryValues } from "../request";
import { clojureString } from "../escape";

function formatClojureMap(pairs: [string, string | string[]][]): string {
    const entries = pairs.map(([key, value]) => {
        const formatted = Array.isArray(value)
            ? `[${value.map(clojureString).join(" ")}]`
            : clojureString(value);
        return `${clojureString(key)} ${formatted}`;
    });

    return `{${entries.join("\n              ")}}`;
}

export function generateClojureCode(request: Request): string {
    let code = `(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (client/request
    {`;

    code += `\n     :url ${clojureString(request.url)}`;

    if (request.query.length > 0) {
        code += `\n     :query-params ${formatClojureMap(queryValues(request.query))}`;
    }

    code += `\n     :method ${/^[A-Za-z0-9_-]+$/.test(request.method) ? `:${request.method.toLowerCase()}` : `(keyword ${clojureString(request.method.toLowerCase())})`}`;

    if (request.headers.length > 0) {
        code += `\n     :headers ${formatClojureMap(request.headers)}`;
    }

    if (request.body !== undefined) {
        code += `\n     :body ${clojureString(request.body)}`;
    }

    code += `}))\n`;

    return code;
}
