import { RequestOptions } from "../main";

export async function generateGoCode(options: RequestOptions): Promise<string> {
    let goCode = `package main

import (
    "bytes"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    `
    const method = options.method ? options.method.toUpperCase() : "GET";

    if (options.body) {
        goCode += `requestData := []byte(\`${options.body}\`)
    req, err := http.NewRequest("${method}", "${options.url}", bytes.NewBuffer(requestData))
    `;
    } else {
        goCode += `req, err = http.NewRequest("${method}", "${options.url}", nil)
    `;
    }

    if (options.headers) {
        goCode += `    
    `;
        for (const key in options.headers) {
            goCode += `req.Header.Set("${key}", "${options.headers[key]}")
    `;
        }
    }

    goCode += `
    if err != nil {
        fmt.Println("Error creating request:", err)
        return
    }

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error sending request:", err)
        return
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        fmt.Println("Error reading response body:", err)
        return
    }
}`;

    return goCode;
}
