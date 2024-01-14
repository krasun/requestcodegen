import { describe, expect, test } from "@jest/globals";
import { generatePythonCode } from "./python";    

describe('generatePythonCode', () => {
    test('should generate correct code when all options are provided', () => {
        const options = {
            url: 'http://example.com',
            query: { key: 'value' },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"key":"value"}'
        };
        const expectedCode = `import requests\n\ndef call_api():\n    url = "http://example.com"\n    params = {"key":"value"}\n    method = "POST"\n    headers = {"Content-Type":"application/json"}\n    data = '{"key":"value"}'\n    response = requests.request(method, url, headers=headers, params=params, data=data)\n    if response.status_code != 200:\n        raise Exception(f"Request failed with status {response.status_code}")\n`;
        expect(generatePythonCode(options)).toBe(expectedCode);
    });

    test('should generate correct code when only url is provided', () => {
        const options = { url: 'http://example.com' };
        const expectedCode = `import requests\n\ndef call_api():\n    url = "http://example.com"\n    params = None\n    method = "GET"\n    headers = None\n    data = None\n    response = requests.request(method, url, headers=headers, params=params, data=data)\n    if response.status_code != 200:\n        raise Exception(f"Request failed with status {response.status_code}")\n`;
        expect(generatePythonCode(options)).toBe(expectedCode);
    });

    test('should generate correct code when method is not provided', () => {
        const options = { url: 'http://example.com', query: { key: 'value' } };
        const expectedCode = `import requests\n\ndef call_api():\n    url = "http://example.com"\n    params = {"key":"value"}\n    method = "GET"\n    headers = None\n    data = None\n    response = requests.request(method, url, headers=headers, params=params, data=data)\n    if response.status_code != 200:\n        raise Exception(f"Request failed with status {response.status_code}")\n`;
        expect(generatePythonCode(options)).toBe(expectedCode);
    });

    test('should generate correct code when headers are not provided', () => {
        const options = { url: 'http://example.com', method: 'POST', body: '{"key":"value"}' };
        const expectedCode = `import requests\n\ndef call_api():\n    url = "http://example.com"\n    params = None\n    method = "POST"\n    headers = None\n    data = '{"key":"value"}'\n    response = requests.request(method, url, headers=headers, params=params, data=data)\n    if response.status_code != 200:\n        raise Exception(f"Request failed with status {response.status_code}")\n`;
        expect(generatePythonCode(options)).toBe(expectedCode);
    });

    test('should generate correct code when body is not provided', () => {
        const options = { url: 'http://example.com', method: 'POST', headers: { 'Content-Type': 'application/json' } };
        const expectedCode = `import requests\n\ndef call_api():\n    url = "http://example.com"\n    params = None\n    method = "POST"\n    headers = {"Content-Type":"application/json"}\n    data = None\n    response = requests.request(method, url, headers=headers, params=params, data=data)\n    if response.status_code != 200:\n        raise Exception(f"Request failed with status {response.status_code}")\n`;
        expect(generatePythonCode(options)).toBe(expectedCode);
    });
});