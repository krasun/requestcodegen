import { describe, expect, test } from "@jest/globals";
import { generateNodeHTTPCode } from "./node-http";
import { generateComparableCode } from "../code";

describe("generateNodeHTTPCode", () => {
    test("should generate correct code with GET method and no query", () => {
        const options = {
            url: "http://localhost/test",
            method: "GET",
        };
        const expectedCode = `const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/test',
    method: 'GET',
    headers: {}
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {});
    res.on('end', () => {});
});

req.on('error', (error) => {
    console.error(error);
});

req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should generate correct code with POST method and query", () => {
        const options = {
            url: "http://localhost/test",
            method: "POST",
            query: { key: "value" },
            body: "body",
        };
        const expectedCode = `const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/test?key=value',
    method: 'POST',
    headers: {}
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {});
    res.on('end', () => {});
});

req.on('error', (error) => {
    console.error(error);
});

req.write('body');
req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should generate correct code with headers", () => {
        const options = {
            url: "http://localhost/test",
            headers: { "Content-Type": "application/json" },
        };
        const expectedCode = `const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/test',
    method: 'GET',
    headers: {"Content-Type":"application/json"}
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {});
    res.on('end', () => {});
});

req.on('error', (error) => {
    console.error(error);
});

req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should generate correct code with port", () => {
        const options = {
            url: "http://localhost:3000/test",
        };
        const expectedCode = `const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/test',
    method: 'GET',
    headers: {}
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {});
    res.on('end', () => {});
});

req.on('error', (error) => {
    console.error(error);
});

req.end();`;
        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should generate correct code with https", () => {
        const options = {
            url: "https://localhost/test",
        };
        const expectedCode = `const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: 'localhost',
    port: 80,
    path: '/test',
    method: 'GET',
    headers: {}
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {});
    res.on('end', () => {});
});

req.on('error', (error) => {
    console.error(error);
});

req.end();`;

        expect(generateComparableCode(generateNodeHTTPCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });
});
