import { RequestOptions } from "../request";

export function generateClojureCode(options: RequestOptions): string {
    let code = `(ns my.namespace\n(:require [clj-http.client :as client]))\n\n(defn make-request []\n`;

    code += `(let [options {:url "${options.url}"`;

    if (options.query) {
        code += `\n:query ${JSON.stringify(options.query)}`;
    }

    if (options.method) {
        code += `\n:method :${options.method.toLowerCase()}`;
    }

    if (options.headers) {
        code += `\n:headers ${JSON.stringify(options.headers)}`;
    }

    if (options.body) {
        code += `\n:body "${options.body}"`;
    }

    code += `}]\n(client/request options))`;

    return code;
}