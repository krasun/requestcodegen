import { RequestOptions, JsonBody } from "../request";

function formatClojureMap(obj: any): string {
    if (typeof obj !== 'object' || obj === null) {
        return `"${obj}"`;
    }

    const entries = Object.entries(obj).map(([k, v]) => {
        if (Array.isArray(v)) {
            const items = v.map(item => formatClojureMap(item)).join(" ");
            return `"${k}" [${items}]`;
        }
        if (typeof v === 'object' && v !== null) {
            return `"${k}" ${formatClojureMap(v)}`;
        }
        return `"${k}" "${v}"`;
    });

    return `{${entries.join("\n              ")}}`;
}

export function generateClojureCode(options: RequestOptions): string {
    let code = `(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (client/request
    {`;

    code += `\n     :url "${options.url}"`;

    if (options.query) {
        code += `\n     :query-params ${formatClojureMap(options.query)}`;
    }

    if (options.method) {
        code += `\n     :method :${options.method.toLowerCase()}`;
    }

    if (options.headers) {
        code += `\n     :headers ${formatClojureMap(options.headers)}`;
    }

    if (options.body) {
        const body = options.body instanceof JsonBody ? options.body.body : options.body;
        code += `\n     :body ${formatClojureMap(body)}`;
    }

    code += `}))\n`;

    return code;
}
