import { Request, queryPairs } from "../request";
import { unsupportedTarget } from "../errors";
import { csharpString } from "../escape";

export function generateCSharpCode(request: Request): string {
    const headers = request.headers;
    const isContentHeader = ([name]: [string, string]) =>
        name.toLowerCase().startsWith("content-");
    if (request.body === undefined && headers.some(isContentHeader)) {
        unsupportedTarget(
            "C#",
            "HttpClient only sends Content-* headers together with a body.",
            "headers"
        );
    }
    const lines: string[] = [];

    lines.push(`using var client = new HttpClient();`);

    if (request.query.length > 0) {
        lines.push(``);
        lines.push(`var query = HttpUtility.ParseQueryString(string.Empty);`);
        for (const [key, value] of queryPairs(request.query)) {
            lines.push(`query.Add(${csharpString(key)}, ${csharpString(value)});`);
        }
    }

    const uri = request.query
        ? `new Uri(${csharpString(request.url + "?")} + query)`
        : `new Uri(${csharpString(request.url)})`;
    lines.push(``);
    lines.push(`var request = new HttpRequestMessage {`);
    lines.push(`    Method = new HttpMethod(${csharpString(request.method)}),`);
    lines.push(`    RequestUri = ${uri}`);
    lines.push(`};`);

    for (const [name, value] of headers.filter((h) => !isContentHeader(h))) {
        lines.push(
            `request.Headers.TryAddWithoutValidation(${csharpString(name)}, ${csharpString(value)});`
        );
    }

    if (request.body !== undefined) {
        lines.push(``);
        lines.push(`request.Content = new StringContent(${csharpString(request.body)}, Encoding.UTF8);`);
        lines.push(`request.Content.Headers.Remove("Content-Type");`);
        for (const [name, value] of headers.filter(isContentHeader)) {
            lines.push(
                `request.Content.Headers.TryAddWithoutValidation(${csharpString(name)}, ${csharpString(value)});`
            );
        }
    }

    lines.push(``);
    lines.push(`using var response = await client.SendAsync(request);`);

    const body = lines
        .map((line) => (line ? `        ${line}` : ""))
        .join("\n");

    return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

public class Program {
    public static async Task Main(string[] args) {
${body}
    }
}`;
}
