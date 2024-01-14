import { RequestOptions } from "../request";

export function generateWgetCode(options: RequestOptions): string {
    let wgetCommand = `wget `;

    if (options.method && options.method.toUpperCase() === "POST") {
        wgetCommand += `--post-data '${options.body}' `;
    }

    if (options.headers) {
        for (const key in options.headers) {
            wgetCommand += `--header '${key}: ${options.headers[key]}' `;
        }
    }

    if (options.query) {
        const query = options.query;
        let queryString = Object.keys(query)
            .map((key) => `${key}=${query[key]}`)
            .join("&");
        wgetCommand += `'${options.url}?${queryString}'`;
    } else {
        wgetCommand += `'${options.url}'`;
    }

    return wgetCommand;
}
