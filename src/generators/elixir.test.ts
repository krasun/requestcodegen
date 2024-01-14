import { describe, expect, test } from "@jest/globals";
import { generateElixirCode } from "./elixir";

describe("generateElixirCode", () => {
    test("should return correct code when method is GET", () => {
        const options = {
            method: "GET",
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
        };
        const result = generateElixirCode(options);
        expect(result).toContain(
            ":get -> HTTPoison.get(url, headers, params: params)"
        );
    });

    test("should return correct code when method is POST", () => {
        const options = {
            method: "POST",
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "value" }),
        };
        const result = generateElixirCode(options);
        expect(result).toContain(
            ":post -> HTTPoison.post(url, body, headers, params: params)"
        );
    });

    test("should return correct code when method is PUT", () => {
        const options = {
            method: "PUT",
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "value" }),
        };
        const result = generateElixirCode(options);
        expect(result).toContain(
            ":put -> HTTPoison.put(url, body, headers, params: params)"
        );
    });

    test("should return error when method is invalid", () => {
        const options = {
            method: "INVALID",
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "value" }),
        };
        const result = generateElixirCode(options);
        expect(result).toContain('_ -> {:error, "Invalid method"}');
    });

    test("should return correct code when options are complete", () => {
        const options = {
            method: "GET",
            url: "http://example.com",
            headers: { "Content-Type": "application/json" },
            query: { key: "value" },
            body: JSON.stringify({ key: "value" }),
        };
        const result = generateElixirCode(options);
        expect(result).toContain("defmodule Example do");
        expect(result).toContain("require HTTPoison");
        expect(result).toContain("def request do");
        expect(result).toContain(
            'headers = {"Content-Type":"application/json"}'
        );
        expect(result).toContain('params = {"key":"value"}');
        expect(result).toContain('body = "{\"key\":\"value\"}');
        expect(result).toContain("method = :get");
        expect(result).toContain('url = "http://example.com"');
    });
});
