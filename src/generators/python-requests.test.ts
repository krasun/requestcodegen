import { describe, expect, test } from "@jest/globals";
import { generatePythonRequestsCode } from "./python-requests";    

describe('generatePythonRequestsCode', () => {
    test('should generate code with default method and no params, headers or data', () => {
        const options = { url: 'http://example.com' };
        const expected = 'import requests\n\n'
            + 'def send_request():\n'
            + '    url = "http://example.com"\n'
            + '    params = None\n'
            + '    method = "GET"\n'
            + '    headers = None\n'
            + '    data = None\n'
            + '    response = requests.request(method, url, headers=headers, params=params, data=data)\n'
            + '    if response.status_code != 200:\n'
            + '        raise Exception("Request failed with status: " + str(response.status_code))\n'
            + 'send_request()\n';
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test('should generate code with provided method, params, headers and data', () => {
        const options = {
            url: 'http://example.com',
            query: { key: 'value' },
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"key":"value"}'
        };
        const expected = 'import requests\n\n'
            + 'def send_request():\n'
            + '    url = "http://example.com"\n'
            + '    params = {"key":"value"}\n'
            + '    method = "POST"\n'
            + '    headers = {"Content-Type":"application/json"}\n'
            + '    data = \'\'\'{"key":"value"}\'\'\'\n'
            + '    response = requests.request(method, url, headers=headers, params=params, data=data)\n'
            + '    if response.status_code != 200:\n'
            + '        raise Exception("Request failed with status: " + str(response.status_code))\n'
            + 'send_request()\n';
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test('should generate code with provided method and no params, headers or data', () => {
        const options = { url: 'http://example.com', method: 'DELETE' };
        const expected = 'import requests\n\n'
            + 'def send_request():\n'
            + '    url = "http://example.com"\n'
            + '    params = None\n'
            + '    method = "DELETE"\n'
            + '    headers = None\n'
            + '    data = None\n'
            + '    response = requests.request(method, url, headers=headers, params=params, data=data)\n'
            + '    if response.status_code != 200:\n'
            + '        raise Exception("Request failed with status: " + str(response.status_code))\n'
            + 'send_request()\n';
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test('should generate code with provided params and no method, headers or data', () => {
        const options = { url: 'http://example.com', query: { key: 'value' } };
        const expected = 'import requests\n\n'
            + 'def send_request():\n'
            + '    url = "http://example.com"\n'
            + '    params = {"key":"value"}\n'
            + '    method = "GET"\n'
            + '    headers = None\n'
            + '    data = None\n'
            + '    response = requests.request(method, url, headers=headers, params=params, data=data)\n'
            + '    if response.status_code != 200:\n'
            + '        raise Exception("Request failed with status: " + str(response.status_code))\n'
            + 'send_request()\n';
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test('should generate code with provided headers and no method, params or data', () => {
        const options = { url: 'http://example.com', headers: { 'Content-Type': 'application/json' } };
        const expected = 'import requests\n\n'
            + 'def send_request():\n'
            + '    url = "http://example.com"\n'
            + '    params = None\n'
            + '    method = "GET"\n'
            + '    headers = {"Content-Type":"application/json"}\n'
            + '    data = None\n'
            + '    response = requests.request(method, url, headers=headers, params=params, data=data)\n'
            + '    if response.status_code != 200:\n'
            + '        raise Exception("Request failed with status: " + str(response.status_code))\n'
            + 'send_request()\n';
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });
});