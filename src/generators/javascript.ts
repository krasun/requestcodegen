import { JsonBody, RequestOptions } from "../request";

export function generateJavaScriptCode(options: RequestOptions): string {
    let code = 'const params = new URLSearchParams({\n';
    
    if (options.query) {
        code += Object.entries(options.query)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `  ${key}: '${v}'`).join(',\n');
                }
                return `  ${key}: '${value}'`;
            })
            .join(',\n');
        code += '\n});\n\n';
    } else {
        code += '});\n\n';
    }

    code += `const requestOptions = {`;
    
    if (options.method) {
        code += `\n  method: '${options.method}',`;
    }

    if (options.headers) {
        code += '\n  headers: {\n';
        code += Object.entries(options.headers)
            .map(([key, value]) => `    '${key}': '${value}'`)
            .join(',\n');
        code += '\n  },';
    }

    if (options.body) {
        if (options.body instanceof JsonBody) { 
            code += '\n  body: ' + JSON.stringify(options.body.body, null, 4).replace(/^/gm, '  ') + ',';
        } else {            
            // If not JSON, use as is
            code += `\n  body: '${options.body}',`;
        }
    }

    code += '\n};\n\n';

    code += `const response = await fetch('${options.url}' + '?' + params.toString(), requestOptions);\n`;

    return code;
}
