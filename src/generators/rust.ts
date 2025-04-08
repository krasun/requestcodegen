import { RequestOptions } from "../request";

export function generateRustCode(options: RequestOptions): string {
    let code = `use reqwest::{Client, Method};
use serde_json::Value;

pub async fn make_request() -> Result<reqwest::Response, reqwest::Error> {
    let client = Client::new();
    let mut url = "${options.url}".parse()?;`;

    if (options.query) {
        const queryStr = JSON.stringify(options.query, null, 4)
            .split('\n')
            .map(line => '    ' + line)
            .join('\n');
            
        code += `
    let query_params: Value = serde_json::json!(
${queryStr}
    );
    if let Value::Object(params) = query_params {
        let query_string = params.iter()
            .flat_map(|(k, v)| match v {
                Value::Array(arr) => arr.iter()
                    .map(|x| (k.clone(), x.to_string()))
                    .collect::<Vec<_>>(),
                _ => vec![(k.clone(), v.to_string())]
            })
            .collect::<Vec<_>>();
        url.query_pairs_mut().extend_pairs(query_string);
    }`;
    }

    code += `
    let request = client.request(Method::${options.method || 'GET'}, url)`;

    if (options.headers) {
        const headersStr = JSON.stringify(options.headers, null, 4)
            .split('\n')
            .map(line => '        ' + line)
            .join('\n');
            
        code += `
        .headers(
${headersStr}
            .into())`;
    }

    if (options.body) {
        if (typeof options.body === 'string') {
            try {
                const parsedBody = JSON.parse(options.body);
                const bodyStr = JSON.stringify(parsedBody, null, 4)
                    .split('\n')
                    .map(line => '        ' + line)
                    .join('\n');
                    
                code += `
        .json(&serde_json::json!(
${bodyStr}
        ))`;
            } catch {
                code += `
        .body("${options.body}")`;
            }
        } else {
            const bodyStr = JSON.stringify(options.body, null, 4)
                .split('\n')
                .map(line => '        ' + line)
                .join('\n');
                
            code += `
        .json(&serde_json::json!(
${bodyStr}
        ))`;
        }
    }

    code += `
        .send()
        .await?;
    Ok(response)
}`;

    return code;
}

