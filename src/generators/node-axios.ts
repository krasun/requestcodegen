import { RequestOptions } from "../request";

export function generateNodeAxiosCode(options: RequestOptions): string {
    function formatObject(obj: any): string {
        if (!obj) return '';
        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';
        
        return `{\n${entries.map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(',\n')}\n}`;
    }

    function formatRequestOptions(): string {
        const opts = [`    method: '${options.method || 'GET'}'`, `    url: '${options.url}'`];

        if (options.query) {
            opts.push(`    params: ${formatObject(options.query)}`);
        }

        if (options.headers) {
            opts.push(`    headers: ${formatObject(options.headers)}`);
        }

        if (options.body) {
            const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
            opts.push(`    data: ${formatObject(bodyData)}`);
        }

        return opts.join(',\n');
    }

    return `const axios = require('axios');

axios({
${formatRequestOptions()}
})
.then(response => response)
.catch(error => {
    throw error;
});`;
}