import { describe, expect, test } from "@jest/globals";
import { generatePythonCode } from "./python";
import { JsonBody } from "../request";

describe("generatePythonCode", () => {
    test("should generate correct code when all options are provided", () => {
        const options = {
            url: "http://example.com",
            query: { key: "value" },
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: new JsonBody({ key: "value" }),
        };

        const result = generatePythonCode(options);
        expect(result).toContain("from urllib.parse import urlencode");
        expect(result).toContain("from urllib.request import Request, urlopen");
        expect(result).toContain("from urllib.error import HTTPError");
        expect(result).toContain("import json");
        expect(result).toContain("import ssl");
        expect(result).toContain("def call_api():");
        expect(result).toContain('url = "http://example.com"');
        expect(result).toContain("request = Request(url)");
        expect(result).toContain('request.method = "POST"');
        expect(result).toContain(
            'request.add_header("Content-Type", "application/json")'
        );
        expect(result).toContain("data = {");
        expect(result).toContain('"key": "value"');
        expect(result).toContain("request.data = json.dumps(data).encode()");
        expect(result).toContain("ctx = ssl.create_default_context()");
        expect(result).toContain("response = urlopen(request, context=ctx)");
    });

    test("should generate correct code when only url is provided", () => {
        const options = { url: "http://example.com" };

        const result = generatePythonCode(options);
        expect(result).toContain("from urllib.parse import urlencode");
        expect(result).toContain("from urllib.request import Request, urlopen");
        expect(result).toContain("from urllib.error import HTTPError");
        expect(result).toContain("import json");
        expect(result).toContain("import ssl");
        expect(result).toContain("def call_api():");
        expect(result).toContain('url = "http://example.com"');
        expect(result).toContain("request = Request(url)");
        expect(result).toContain('request.method = "GET"');
        expect(result).toContain("ctx = ssl.create_default_context()");
        expect(result).toContain("response = urlopen(request, context=ctx)");
    });

    test("should generate correct code when method is not provided", () => {
        const options = { url: "http://example.com", query: { key: "value" } };

        const result = generatePythonCode(options);
        expect(result).toContain("from urllib.parse import urlencode");
        expect(result).toContain("from urllib.request import Request, urlopen");
        expect(result).toContain("from urllib.error import HTTPError");
        expect(result).toContain("import json");
        expect(result).toContain("import ssl");
        expect(result).toContain("def call_api():");
        expect(result).toContain('url = "http://example.com"');
        expect(result).toContain("request = Request(url)");
        expect(result).toContain('request.method = "GET"');
        expect(result).toContain("ctx = ssl.create_default_context()");
        expect(result).toContain("response = urlopen(request, context=ctx)");
    });

    test("should generate correct code when headers are not provided", () => {
        const options = {
            url: "http://example.com",
            method: "POST",
            body: new JsonBody({ key: "value" }),
        };

        const result = generatePythonCode(options);

        console.log(result);

        expect(result).toContain("from urllib.parse import urlencode");
        expect(result).toContain("from urllib.request import Request, urlopen");
        expect(result).toContain("from urllib.error import HTTPError");
        expect(result).toContain("import json");
        expect(result).toContain("import ssl");
        expect(result).toContain("def call_api():");
        expect(result).toContain('url = "http://example.com"');
        expect(result).toContain("request = Request(url)");
        expect(result).toContain('request.method = "POST"');
        expect(result).toContain("data = {");
        expect(result).toContain('"key": "value"');
        expect(result).toContain("request.data = json.dumps(data).encode()");
        expect(result).toContain("ctx = ssl.create_default_context()");
        expect(result).toContain("response = urlopen(request, context=ctx)");
    });

    test("should generate correct code when body is not provided", () => {
        const options = {
            url: "http://example.com",
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };

        const result = generatePythonCode(options);
        expect(result).toContain("from urllib.parse import urlencode");
        expect(result).toContain("from urllib.request import Request, urlopen");
        expect(result).toContain("from urllib.error import HTTPError");
        expect(result).toContain("import json");
        expect(result).toContain("import ssl");
        expect(result).toContain("def call_api():");
        expect(result).toContain('url = "http://example.com"');
        expect(result).toContain("request = Request(url)");
        expect(result).toContain('request.method = "POST"');
        expect(result).toContain(
            'request.add_header("Content-Type", "application/json")'
        );
        expect(result).toContain("ctx = ssl.create_default_context()");
        expect(result).toContain("response = urlopen(request, context=ctx)");
    });
});
