import { Request, queryPairs } from "../request";
import { goString } from "../escape";

export function generateGoCode(request: Request): string {
    const imports = ["fmt", "net/http"];
    const lines: string[] = [];

    lines.push(`client := &http.Client{}`);
    lines.push(``);

    if (request.body !== undefined) {
        imports.push("strings");
        lines.push(`body := strings.NewReader(${goString(request.body)})`);
        lines.push(
            `req, err := http.NewRequest(${goString(request.method)}, ${goString(request.url)}, body)`
        );
    } else {
        lines.push(
            `req, err := http.NewRequest(${goString(request.method)}, ${goString(request.url)}, nil)`
        );
    }
    lines.push(`if err != nil {`);
    lines.push(`    fmt.Println(err)`);
    lines.push(`    return`);
    lines.push(`}`);

    if (request.headers.length > 0) {
        lines.push(``);
        for (const [key, value] of request.headers) {
            lines.push(
                key.toLowerCase() === "host"
                    ? `req.Host = ${goString(value)}`
                    : `req.Header.Set(${goString(key)}, ${goString(value)})`
            );
        }
    }

    if (request.query.length > 0) {
        // url.Values.Encode() sorts keys, which would change the order (and signatures).
        imports.push("net/url");
        if (!imports.includes("strings")) {
            imports.push("strings");
        }
        lines.push(``);
        lines.push(`params := []string{`);
        for (const [key, value] of queryPairs(request.query)) {
            lines.push(`    url.QueryEscape(${goString(key)}) + "=" + url.QueryEscape(${goString(value)}),`);
        }
        lines.push(`}`);
        lines.push(`req.URL.RawQuery = strings.Join(params, "&")`);
    }

    lines.push(``);
    lines.push(`resp, err := client.Do(req)`);
    lines.push(`if err != nil {`);
    lines.push(`    fmt.Println(err)`);
    lines.push(`    return`);
    lines.push(`}`);
    lines.push(`defer resp.Body.Close()`);

    return `package main

import (
${imports.sort().map((name) => `    "${name}"`).join("\n")}
)

func main() {
${lines.map((line) => (line ? `    ${line}` : "")).join("\n")}
}`;
}
