import { describe, expect, test } from "@jest/globals";
import { generatePHPRequestsCode } from "./php-requests";
import { writeFile } from "fs";

describe("generatePHPRequestsCode", () => {
    test("should generate correct PHP code with GET method", () => {
        const options = {
            method: "GET",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: "",
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'GET';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(
            `$headers = {"Content-Type":"application/json"};`
        );
        expect(result).toContain(`$query = {"key":"value"};`);
        expect(result).toContain(`$body = "";`);
    });

    test("should generate correct PHP code with POST method", () => {
        const options = {
            method: "POST",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: JSON.stringify({ data: "test" }),
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'POST';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(
            `$headers = {"Content-Type":"application/json"};`
        );
        expect(result).toContain(`$query = {"key":"value"};`);
        expect(result).toContain(`$body = {"data":"test"};`);
    });

    test("should generate correct PHP code with PUT method", () => {
        const options = {
            method: "PUT",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: JSON.stringify({ data: "test" }),
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'PUT';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(
            `$headers = {"Content-Type":"application/json"};`
        );
        expect(result).toContain(`$query = {"key":"value"};`);
        expect(result).toContain(`$body = {"data":"test"};`);
    });

    test("should generate correct PHP code with DELETE method", () => {
        const options = {
            method: "DELETE",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: "",
        };
        const result = generatePHPRequestsCode(options);
        expect(result).toContain(`$method = 'DELETE';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(
            `$headers = {"Content-Type":"application/json"};`
        );
        expect(result).toContain(`$query = {"key":"value"};`);
        expect(result).toContain(`$body = "";`);
    });

    test("should generate correct PHP code with PATCH method", () => {
        const options = {
            method: "PATCH",
            url: "https://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: JSON.stringify({ data: "test" }),
        };
        const result = generatePHPRequestsCode(options);

        expect(result).toContain(`$method = 'PATCH';`);
        expect(result).toContain(`$url = 'https://example.com';`);
        expect(result).toContain(
            `$headers = {"Content-Type":"application/json"};`
        );
        expect(result).toContain(`$query = {"key":"value"};`);
        expect(result).toContain(`$body = {"data":"test"};`);
    });
});
