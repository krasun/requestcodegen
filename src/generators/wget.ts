import { JsonBody, RequestOptions } from "../request";

export function generateWgetCode(options: RequestOptions): string {
    let wgetCommand = `wget`;

    if (options.method && options.method.toUpperCase() === "POST") {
        if (options.body instanceof JsonBody) {
            wgetCommand += ` --post-data '${JSON.stringify(options.body.body)}'`;
        } else if (options.body) {
            wgetCommand += ` --post-data '${options.body}'`;
        }
    }

    if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
            wgetCommand += ` \\\n  --header '${key}: ${value}'`;
        }
    }

    let url = options.url;
    if (options.query) {
        const queryParams = [];
        for (const [key, value] of Object.entries(options.query)) {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
                });
            } else {
                queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
        url += (url.includes("?") ? "&" : "?") + queryParams.join("&");
    }

    wgetCommand += ` \\\n  '${url}'`;

    return wgetCommand;
}
