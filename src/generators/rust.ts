import { RequestOptions } from "../request";

export function generateRustCode(options: RequestOptions): string {
    let code = `use std::collections::HashMap;
use reqwest::{Client, Method, Url, header};

pub async fn make_request() -> Result<(), reqwest::Error> {
    let client = Client::new();
    let mut url = Url::parse("${options.url}").unwrap();`;

    if (options.query) {
        code += `\n    let mut params = HashMap::new();`;
        for (const key in options.query) {
            if (Array.isArray(options.query[key])) {
                (options.query[key] as string[]).forEach((value: string) => {
                    code += `\n    params.insert("${key}", "${value}");`;
                });
            } else {
                code += `\n    params.insert("${key}", "${options.query[key]}");`;
            }
        }
        code += `\n    url.query_pairs_mut().extend_pairs(params.into_iter());`;
    }

    if (options.method) {
        code += `\n    let method = Method::from_bytes(b"${options.method}").unwrap();`;
    } else {
        code += `\n    let method = Method::GET;`;
    }

    if (options.headers) {
        code += `\n    let mut headers = header::HeaderMap::new();`;
        for (const key in options.headers) {
            code += `\n    headers.insert("${key}", "${options.headers[key]}".parse().unwrap());`;
        }
    }

    code += `\n    let request = client.request(method, url);`;

    if (options.body) {
        code += `\n    request.body("${options.body}");`;
    }

    code += `\n    let response = request.send().await?;\n    Ok(())\n}`;

    return code;
}
