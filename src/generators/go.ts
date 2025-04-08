import { JsonBody, RequestOptions } from "../request";

export function generateGoCode(options: RequestOptions): string {
    // Helper function to format query parameters
    function formatQueryParams(query: any): string {
        if (!query) return "";
        const entries = Object.entries(query);
        if (entries.length === 0) return "";

        const params = entries
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value
                        .map((v) => `        params.Add("${key}", "${v}")`)
                        .join("\n");
                }
                return `        params.Add("${key}", "${value}")`;
            })
            .join("\n");

        return `
    params := url.Values{}\n${params}
    req.URL.RawQuery = params.Encode()`;
    }

    // Helper function to format headers
    function formatHeaders(headers: any): string {
        if (!headers) return "";
        const entries = Object.entries(headers);
        if (entries.length === 0) return "";

        return entries
            .map(
                ([key, value]) => `        req.Header.Add("${key}", "${value}")`
            )
            .join("\n");
    }

    function formatBody(body: any): string {
        if (body instanceof JsonBody) {
            return JSON.stringify(body.body, null, 4);
        }

        return body;
    }

    const code = `package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
    "net/url"
)

func main() {
    client := &http.Client{}
    
    url := "${options.url}"
    method := "${options.method || "GET"}"

    var req *http.Request
    var err error
${
    options.body
        ? `
    jsonBody := \`${formatBody(options.body)}\`
    req, err = http.NewRequest(method, url, bytes.NewBufferString(jsonBody))`
        : `
    req, err = http.NewRequest(method, url, nil)`
}
    if err != nil {
        fmt.Println(err)
        return
    }
${options.headers ? `\n${formatHeaders(options.headers)}` : ""}${
        options.query ? formatQueryParams(options.query) : ""
    }

    resp, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer resp.Body.Close()
}`;

    return code;
}
