import { RequestOptions } from "../request";

export function generateCSharpCode(options: RequestOptions): string {
    let code = `using System;
using System.Net.Http;
using System.Threading.Tasks;

public class Program
{
    public static async Task Main(string[] args)
    {
        using (var client = new HttpClient())
        {
            var request = new HttpRequestMessage
            {
                Method = new HttpMethod("${options.method || 'GET'}"),
                RequestUri = new Uri("${options.url}"),
            };
            
            ${options.headers ? Object.entries(options.headers).map(([key, value]) => `request.Headers.Add("${key}", "${value}");`).join('\n') : ''}
            
            ${options.body ? `request.Content = new StringContent("${options.body}");` : ''}
            
            ${options.query ? `var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
            ${Object.entries(options.query).map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `query["${key}"] = "${v}";`).join('\n');
                } else {
                    return `query["${key}"] = "${value}";`;
                }
            }).join('\n')}
            request.RequestUri = new Uri(request.RequestUri + "?" + query);` : ''}
            
            try
            {
                using (var response = await client.SendAsync(request))
                {
                    response.EnsureSuccessStatusCode();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}`;
    return code;
}