import { RequestOptions } from "../request";

export function generateGoCode(options: RequestOptions): string {
    let code = `package main

import (
    "bytes"
    "fmt"
    "net/http"
    "net/url"
)

func main() {
    url := "${options.url}"
    method := "${options.method || 'GET'}"

    client := &http.Client {
    }
    var req *http.Request
    var err error

    if method == "POST" || method == "PUT" {
        var jsonStr = []byte(\`${options.body || ''}\`)
        req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonStr))
    } else {
        req, err = http.NewRequest(method, url, nil)
    }

    if err != nil {
        fmt.Println(err)
        return
    }

    ${options.headers ? Object.entries(options.headers).map(([key, value]) => `req.Header.Add("${key}", "${value}")`).join('\n    ') : ''}

    ${options.query ? `params := url.Values{}\n    ` + Object.entries(options.query).map(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map(v => `params.Add("${key}", "${v}")`).join('\n    ')
        } else {
            return `params.Add("${key}", "${value}")`
        }
    }).join('\n    ') + '\n    req.URL.RawQuery = params.Encode()' : ''}

    res, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer res.Body.Close()
}
`
    return code;
}