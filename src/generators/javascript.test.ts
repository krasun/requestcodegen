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

        const expectedCode = `const params = new URLSearchParams({
  param1: 'value1',
  param2: 'value2'
});

const requestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: '{"key":"value"}',
};

const response = await fetch('https://example.com' + '?' + params.toString(), requestOptions);
`;

        expect(generateJavaScriptCode(options)).toBe(expectedCode);
    });

    test("should generate correct code with only url", () => {
        const options = {
            url: "https://example.com",
        };

        const expectedCode = `const params = new URLSearchParams({
});

const requestOptions = {
};

const response = await fetch('https://example.com' + '?' + params.toString(), requestOptions);
`;

        expect(generateJavaScriptCode(options)).toBe(expectedCode);
    });

    test("should generate correct code with url and array query params", () => {
        const options = {
            url: "https://example.com",
            query: { tags: ["tag1", "tag2"] },
            headers: { "Content-Type": "application/json" },
        };

        const expectedCode = `const params = new URLSearchParams({
  tags: 'tag1',
  tags: 'tag2'
});

const requestOptions = {
  headers: {
    'Content-Type': 'application/json'
  },
};

const response = await fetch('https://example.com' + '?' + params.toString(), requestOptions);
`;

        expect(generateJavaScriptCode(options)).toBe(expectedCode);
    });
});
