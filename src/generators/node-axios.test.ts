import { describe, expect, test } from "@jest/globals";
import { generateNodeAxiosCode } from "./node-axios";

describe("generateNodeAxiosCode", () => {
    test("should generate axios code with default method", () => {
        const options = {
            url: "http://test.com",
        };
        const expectedCode = `const axios = require('axios');\n\naxios({ method: 'GET', url: 'http://test.com' })\n.then(function (response) {\n    // do something with the response...\n}).catch(function (error) {\n    console.error(error);\n});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with provided method", () => {
        const options = {
            url: "http://test.com",
            method: "POST",
        };
        const expectedCode = `const axios = require('axios');\n\naxios({ method: 'POST', url: 'http://test.com' })\n.then(function (response) {\n    // do something with the response...\n}).catch(function (error) {\n    console.error(error);\n});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with query parameters", () => {
        const options = {
            url: "http://test.com",
            query: { param1: "value1", param2: "value2" },
        };
        const expectedCode = `const axios = require('axios');\n\naxios({ method: 'GET', url: 'http://test.com', params: {"param1":"value1","param2":"value2"} })\n.then(function (response) {\n    // do something with the response...\n}).catch(function (error) {\n    console.error(error);\n});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with headers", () => {
        const options = {
            url: "http://test.com",
            headers: { "Content-Type": "application/json" },
        };
        const expectedCode = `const axios = require('axios');\n\naxios({ method: 'GET', url: 'http://test.com', headers: {"Content-Type":"application/json"} })\n.then(function (response) {\n    // do something with the response...\n}).catch(function (error) {\n    console.error(error);\n});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with body", () => {
        const options = {
            url: "http://test.com",
            body: JSON.stringify({ key: "value" }),
        };
        const expectedCode = `const axios = require('axios');\n\naxios({ method: 'GET', url: 'http://test.com', data: ${options.body} })\n.then(function (response) {\n    // do something with the response...\n}).catch(function (error) {\n    console.error(error);\n});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });
});
