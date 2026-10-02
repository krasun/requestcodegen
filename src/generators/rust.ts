import { Request, queryPairs } from "../request";
import { rustString } from "../escape";

/** Rust with reqwest (async) and tokio. */
export function generateRustCode(request: Request): string {
    const lines: string[] = [];
    lines.push(`let client = reqwest::Client::new();`);
    lines.push(
        `let method = reqwest::Method::from_bytes(${rustString(request.method)}.as_bytes()).unwrap();`
    );
    lines.push(`let response = client`);
    lines.push(`    .request(method, ${rustString(request.url)})`);

    if (request.query.length > 0) {
        lines.push(`    .query(&[`);
        for (const [key, value] of queryPairs(request.query)) {
            lines.push(`        (${rustString(key)}, ${rustString(value)}),`);
        }
        lines.push(`    ])`);
    }

    for (const [key, value] of request.headers) {
        lines.push(`    .header(${rustString(key)}, ${rustString(value)})`);
    }

    if (request.body !== undefined) {
        lines.push(`    .body(${rustString(request.body)})`);
    }

    lines.push(`    .send()`);
    lines.push(`    .await?;`);
    lines.push(`Ok(response)`);

    return `pub async fn make_request() -> Result<reqwest::Response, reqwest::Error> {
${lines.map((line) => `    ${line}`).join("\n")}
}`;
}
