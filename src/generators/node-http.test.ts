import { describe, expect, test } from "@jest/globals";
import { generateNodeHTTPCode } from "./node-http";
import { generateComparableCode } from "../code";
import { JsonBody } from "../request";

describe("generateNodeHTTPCode", () => {
    test("should generate correct code with GET method and no query", () => {
        const options = {
            url: "http://localhost/test",
            method: "GET",
        };
        const expectedCode = `const http = require('http');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/test',
    method: 'GET',
    headers: {}
};

let response = '';
const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
        response += chunk;
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should generate correct code with POST method and query parameters", () => {
        const options = {
            url: "http://localhost/test",
            method: "POST",
            query: { key: "value", array: ["item1", "item2"] },
            body: new JsonBody({ data: "example" }),
        };
        const expectedCode = `const http = require('http');
const querystring = require('querystring');

const query = {
    key: "value",
    array: ["item1","item2"]
};

const body = {
    data: "example"
};

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/test'+'?'+querystring.stringify(query),
    method: 'POST',
    headers: {}
};

let response = '';
const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
        response += chunk;
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(JSON.stringify(body));
req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should generate correct code with HTTPS", () => {
        const options = {
            url: "https://api.example.com/test",
            headers: { "Content-Type": "application/json" },
        };
        const expectedCode = `const https = require('https');

const options = {
    hostname: 'api.example.com',
    port: 443,
    path: '/test',
    method: 'GET',
    headers: {"Content-Type":"application/json"}
};

let response = '';
const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
        response += chunk;
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should generate correct code with non-JSON body", () => {
        const options = {
            url: "http://localhost/test",
            method: "POST",
            body: "raw body content",
        };
        const expectedCode = `const http = require('http');

const body = "raw body content";

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/test',
    method: 'POST',
    headers: {}
};

let response = '';
const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
        response += chunk;
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(body);
req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });
});
