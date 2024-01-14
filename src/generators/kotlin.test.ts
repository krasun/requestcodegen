import { describe, expect, test } from "@jest/globals";
import { generateKotlinCode } from "./kotlin";
import { generateComparableCode } from "../code";

describe("generateKotlinCode", () => {
    test("should return correct kotlin code with default method GET when no method is provided", () => {
        const options = {
            url: "http://test.com",
        };
        const expectedCode = `
    import java.net.URL
    import java.net.HttpURLConnection
    import java.io.OutputStreamWriter

    fun makeRequest() {
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw RuntimeException("HTTP error code: $responseCode")
        }
    }
    `;
        expect(generateComparableCode(generateKotlinCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should return correct kotlin code with provided method", () => {
        const options = {
            url: "http://test.com",
            method: "POST",
        };
        const expectedCode = `
    import java.net.URL
    import java.net.HttpURLConnection
    import java.io.OutputStreamWriter

    fun makeRequest() {
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw RuntimeException("HTTP error code: $responseCode")
        }
    }
    `;
        expect(generateComparableCode(generateKotlinCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should return correct kotlin code with provided headers", () => {
        const options = {
            url: "http://test.com",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const expectedCode = `
    import java.net.URL
    import java.net.HttpURLConnection
    import java.io.OutputStreamWriter

    fun makeRequest() {
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.setRequestProperty("Content-Type", "application/json")

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw RuntimeException("HTTP error code: $responseCode")
        }
    }
    `;
        expect(generateComparableCode(generateKotlinCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });

    test("should return correct kotlin code with provided body", () => {
        const options = {
            url: "http://test.com",
            body: "test body",
        };
        const expectedCode = `
    import java.net.URL
    import java.net.HttpURLConnection
    import java.io.OutputStreamWriter

    fun makeRequest() {
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        val out = OutputStreamWriter(connection.outputStream)
        out.write("test body")
        out.close()

        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw RuntimeException("HTTP error code: $responseCode")
        }
    }
    `;
        expect(generateComparableCode(generateKotlinCode(options))).toBe(
            generateComparableCode(expectedCode)
        );
    });
});
