import { describe, expect, test } from "@jest/globals";
import { generatePHPGuzzleCode } from "./php-guzzle";
import { generateComparableCode } from "../code";

describe("generatePHPGuzzleCode", () => {
    test("should generate code with GET method and no headers, query or body", () => {
        const options = {
            method: "GET",
            url: "https://example.com",
        };
        const result = generatePHPGuzzleCode(options);
        expect(generateComparableCode(result)).toContain(
            generateComparableCode(
                `$client->request('GET', 'https://example.com', []);`
            )
        );
    });

    test("should generate code with POST method and headers", () => {
        const options = {
            method: "POST",
            url: "https://example.com",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const result = generatePHPGuzzleCode(options);
        expect(generateComparableCode(result)).toContain(
            generateComparableCode(
                `'headers' => ['Content-Type' => 'application/json',],`
            )
        );
    });

    test("should generate code with PUT method, headers and query", () => {
        const options = {
            method: "PUT",
            url: "https://example.com",
            headers: {
                "Content-Type": "application/json",
            },
            query: {
                id: "123",
            },
        };
        const result = generatePHPGuzzleCode(options);
        expect(generateComparableCode(result)).toContain(
            generateComparableCode(`'query' => ['id' => '123',],`)
        );        
    });

    test("should generate code with DELETE method, headers, query and body", () => {
        const options = {
            method: "DELETE",
            url: "https://example.com",
            headers: {
                "Content-Type": "application/json",
            },
            query: {
                id: "123",
            },
            body: '{"name":"John"}',
        };
        const result = generatePHPGuzzleCode(options);
        expect(generateComparableCode(result)).toContain(
            generateComparableCode(`'body' => '{"name":"John"}',`)
        );
    });

    test("should generate code with PATCH method, headers, query and body", () => {
        const options = {
            method: "PATCH",
            url: "https://example.com",
            headers: {
                "Content-Type": "application/json",
            },
            query: {
                id: "123",
            },
            body: '{"name":"John"}',
        };
        const result = generatePHPGuzzleCode(options);
        expect(generateComparableCode(result)).toContain(
            generateComparableCode(
                `$client->request('PATCH', 'https://example.com',`
            )
        );
    });
});
