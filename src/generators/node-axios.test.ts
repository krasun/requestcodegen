import { describe, expect, test } from "@jest/globals";
import { generateNodeAxiosCode } from "./node-axios";

describe("generateNodeAxiosCode", () => {
    test("should generate axios code with default method", () => {
        const options = {
            url: "http://test.com",
        };
        const expectedCode = `const axios = require('axios');

axios({
    method: 'GET',
    url: 'http://test.com'
})
.then(response => response)
.catch(error => {
    throw error;
});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with provided method", () => {
        const options = {
            url: "http://test.com",
            method: "POST",
        };
        const expectedCode = `const axios = require('axios');

axios({
    method: 'POST',
    url: 'http://test.com'
})
.then(response => response)
.catch(error => {
    throw error;
});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with query parameters", () => {
        const options = {
            url: "http://test.com",
            query: { param1: "value1", param2: "value2" },
        };
        const expectedCode = `const axios = require('axios');

axios({
    method: 'GET',
    url: 'http://test.com',
    params: {
    "param1": "value1",
    "param2": "value2"
}
})
.then(response => response)
.catch(error => {
    throw error;
});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with headers", () => {
        const options = {
            url: "http://test.com",
            headers: { "Content-Type": "application/json" },
        };
        const expectedCode = `const axios = require('axios');

axios({
    method: 'GET',
    url: 'http://test.com',
    headers: {
    "Content-Type": "application/json"
}
})
.then(response => response)
.catch(error => {
    throw error;
});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with body", () => {
        const options = {
            url: "http://test.com",
            method: "POST",
            body: JSON.stringify({ key: "value", nested: { prop: "test" } }),
        };
        const expectedCode = `const axios = require('axios');

axios({
    method: 'POST',
    url: 'http://test.com',
    data: {
    "key": "value",
    "nested": {"prop":"test"}
}
})
.then(response => response)
.catch(error => {
    throw error;
});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });

    test("should generate axios code with array in query parameters", () => {
        const options = {
            url: "http://test.com",
            query: { tags: ["tag1", "tag2"], filter: "active" },
        };
        const expectedCode = `const axios = require('axios');

axios({
    method: 'GET',
    url: 'http://test.com',
    params: {
    "tags": ["tag1","tag2"],
    "filter": "active"
}
})
.then(response => response)
.catch(error => {
    throw error;
});`;
        expect(generateNodeAxiosCode(options)).toBe(expectedCode);
    });
});
