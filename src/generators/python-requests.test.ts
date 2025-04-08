import { JsonBody, RequestOptions } from "../request";
import { describe, expect, test } from "@jest/globals";
import { generatePythonRequestsCode } from "./python-requests";

describe("generatePythonRequestsCode", () => {
    test("should generate code with default method and no params, headers or data", () => {
        const options = { url: "http://example.com" };
        const expected =
            "import requests\n\n" +
            "def call_api():\n" +
            '    url = "http://example.com"\n' +
            "    params = None\n" +
            '    method = "GET"\n' +
            "    headers = None\n" +
            "    data = None\n" +
            "    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)\n";
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test("should generate code with provided method, params, headers and JSON body", () => {
        const jsonBody = new JsonBody({ key: "value" });
        const options = {
            url: "http://example.com",
            query: { key: "value" },
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: jsonBody,
        };
        const expected =
            "import requests\n\n" +
            "def call_api():\n" +
            '    url = "http://example.com"\n' +
            "    params = {\n" +
            '        "key": "value",\n' +
            "    }\n" +
            '    method = "POST"\n' +
            "    headers = {\n" +
            '        "Content-Type": "application/json",\n' +
            "    }\n" +
            "    data = {\n" +
            '        "key": "value",\n' +
            "    }\n" +
            "    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)\n";
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test("should generate code with provided method and no params, headers or data", () => {
        const options = { url: "http://example.com", method: "DELETE" };
        const expected =
            "import requests\n\n" +
            "def call_api():\n" +
            '    url = "http://example.com"\n' +
            "    params = None\n" +
            '    method = "DELETE"\n' +
            "    headers = None\n" +
            "    data = None\n" +
            "    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)\n";
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test("should generate code with provided params and no method, headers or data", () => {
        const options = { url: "http://example.com", query: { key: "value" } };
        const expected =
            "import requests\n\n" +
            "def call_api():\n" +
            '    url = "http://example.com"\n' +
            "    params = {\n" +
            '        "key": "value",\n' +
            "    }\n" +
            '    method = "GET"\n' +
            "    headers = None\n" +
            "    data = None\n" +
            "    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)\n";
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test("should generate code with provided headers and no method, params or data", () => {
        const options = {
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
        };
        const expected =
            "import requests\n\n" +
            "def call_api():\n" +
            '    url = "http://example.com"\n' +
            "    params = None\n" +
            '    method = "GET"\n' +
            "    headers = {\n" +
            '        "Content-Type": "application/json",\n' +
            "    }\n" +
            "    data = None\n" +
            "    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)\n";
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });

    test("should generate code with raw string body", () => {
        const options = {
            url: "http://example.com",
            method: "POST",
            body: "raw string data",
        };
        const expected =
            "import requests\n\n" +
            "def call_api():\n" +
            '    url = "http://example.com"\n' +
            "    params = None\n" +
            '    method = "POST"\n' +
            "    headers = None\n" +
            "    data = 'raw string data'\n" +
            "    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)\n";
        expect(generatePythonRequestsCode(options)).toBe(expected);
    });
});
