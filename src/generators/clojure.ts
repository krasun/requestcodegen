import { RequestOptions } from "../request";

function jsonToClojure(jsonStr: string): string {
    try {
        const obj = JSON.parse(jsonStr);
        return JSON.stringify(obj)
            .replace(/:/g, " ") 
            .replace(/,/g, "") 
            .replace(/"\s*{/g, "{") 
            .replace(/}"/g, "}") 
            .replace(/"([^"]+)"\s+"([^"]+)"/g, '"$1" "$2"'); 
    } catch (e) {
        return `"${jsonStr}"`;
    }
}

export function generateClojureCode(options: RequestOptions): string {
    let code = `(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (let [options {:url "${options.url}"`;

    if (options.query) {
        const queryStr = JSON.stringify(options.query)
            .replace(/:\s*/g, ":")
            .replace(/,\s*/g, ",");
        code += `\n         :query ${queryStr}`;
    }

    if (options.method) {
        code += `\n         :method :${options.method.toLowerCase()}`;
    }

    if (options.headers) {
        const headersStr = JSON.stringify(options.headers)
            .replace(/:\s*/g, ":")
            .replace(/,\s*/g, ",");
        code += `\n         :headers ${headersStr}`;
    }

    if (options.body) {
        code += `\n         :body ${jsonToClojure(options.body)}`;
    }

    code += `}]\n    (let [response (client/request options)]
      response)))`;

    return code;
}
