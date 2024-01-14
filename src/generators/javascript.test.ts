import { describe, expect, test } from "@jest/globals";
import { generateJavaScriptCode } from "./javascript";

describe("generateJavaScriptCode", () => {
    test("should generate correct code with all options", () => {
        const options = {
            url: "https://example.com",
            query: { param1: "value1", param2: "value2" },
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "value" }),
        };

        const expectedCode = `fetch('https://example.com?param1=value1&param2=value2', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: '{"key":"value"}',
})
.catch(error => console.error('Error:', error));`;

        expect(generateJavaScriptCode(options)).toBe(expectedCode);
    });

    test("should generate correct code with only url", () => {
        const options = {
            url: "https://example.com",
        };

        const expectedCode = `fetch('https://example.com', {
})
.catch(error => console.error('Error:', error));`;

        expect(generateJavaScriptCode(options)).toBe(expectedCode);
    });

    test("should generate correct code with url and headers", () => {
        const options = {
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
        };

        const expectedCode = `fetch('https://example.com', {
headers: {
'Content-Type': 'application/json'
},
})
.catch(error => console.error('Error:', error));`;

        expect(generateJavaScriptCode(options)).toBe(expectedCode);
    });
});
