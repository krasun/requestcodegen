import { JsonBody, RequestOptions } from "../request";

export function generateCSharpCode(options: RequestOptions): string {
    // Remove content-type from headers if it's JSON since it will be set by StringContent
    const headers = { ...options.headers };
    const isJsonContent =
        headers &&
        Object.entries(headers).some(
            ([key, value]) =>
                key.toLowerCase() === "content-type" &&
                value.toLowerCase().includes("json")
        );

    // Helper function to convert JSON to C# object initialization syntax
    function toCSharpObject(obj: any, indent: number = 3): string {
        if (obj === null) return "null";
        if (typeof obj === "string") return `"${obj}"`;
        if (typeof obj === "number" || typeof obj === "boolean")
            return obj.toString();
        if (Array.isArray(obj)) {
            if (obj.length === 0) return "new object[] {}";
            const items = obj
                .map((item) => toCSharpObject(item, indent + 1))
                .join(",\n" + " ".repeat(indent * 4));
            return `new object[] {\n${" ".repeat(
                indent * 4
            )}${items}\n${" ".repeat((indent - 1) * 4)}}`;
        }
        if (obj instanceof JsonBody) {
            const entries = Object.entries(obj.body);
            if (entries.length === 0) return "new {}";
            const props = entries
                .map(
                    ([key, value]) =>
                        `${key} = ${toCSharpObject(value, indent + 1)}`
                )
                .join(",\n" + " ".repeat(indent * 4));
            return `new {\n${" ".repeat(indent * 4)}${props}\n${" ".repeat(
                (indent - 1) * 4
            )}}`;
        }
        return "null";
    }

    let code = `using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;

public class Program {
    public static async Task Main(string[] args) {
        using var client = new HttpClient();
        ${
            isJsonContent && options.body
                ? `var requestData = ${toCSharpObject(
                      options.body
                  )};\n\n        `
                : ""
        }var request = new HttpRequestMessage {
            Method = new HttpMethod("${options.method || "GET"}"),
            RequestUri = new Uri("${options.url}")
        };
        ${Object.entries(headers || {})
            .map(
                ([key, value]) =>
                    `request.Headers.Add("${key}", "${value}");\n        `
            )
            .join("")}
        ${
            options.body
                ? isJsonContent
                    ? `var jsonOptions = new JsonSerializerOptions { 
        };
        request.Content = new StringContent(
            JsonSerializer.Serialize(requestData, jsonOptions),
            System.Text.Encoding.UTF8,
            "application/json"
        );`
                    : `request.Content = new StringContent("${options.body}");`
                : ""
        }
        ${
            options.query
                ? `var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        ${Object.entries(options.query)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value
                        .map((v) => `query["${key}"] = "${v}";\n        `)
                        .join("");
                } else {
                    return `query["${key}"] = "${value}";\n        `;
                }
            })
            .join(
                ""
            )}request.RequestUri = new Uri(request.RequestUri + "?" + query);`
                : ""
        }
        try {
            using var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();            
        } catch (Exception ex) {
            Console.WriteLine(ex.ToString());
        }
    }
}`;
    return code;
}
