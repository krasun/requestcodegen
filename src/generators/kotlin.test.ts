import { describe, expect, test } from "@jest/globals";
import { generateKotlinCode } from "./kotlin";
import { generateComparableCode } from "../code";
import { JsonBody } from "../request";

describe("generateKotlinCode", () => {
    test("should return correct kotlin code with default method GET when no method is provided", () => {
        const options = {
            url: "http://test.com",
        };
        const expectedCode = `
    import java.net.URL
    import java.net.HttpURLConnection
    import com.google.gson.Gson

    fun makeRequest() {
        val gson = Gson()
        val params = mutableMapOf<String, String>()
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        val response = connection.inputStream.bufferedReader().use { it.readText() }
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
    import com.google.gson.Gson

    fun makeRequest() {
        val gson = Gson()
        val params = mutableMapOf<String, String>()
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        val response = connection.inputStream.bufferedReader().use { it.readText() }
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
    import com.google.gson.Gson

    fun makeRequest() {
        val gson = Gson()
        val params = mutableMapOf<String, String>()
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.setRequestProperty("Content-Type", "application/json")
        val response = connection.inputStream.bufferedReader().use { it.readText() }
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

    test("should return correct kotlin code with provided JSON body", () => {
        const options = {
            url: "http://test.com",
            method: "POST",
            body: new JsonBody({ key: "value", number: 42 }),
        };
        const expectedCode = `
    import java.net.URL
    import java.net.HttpURLConnection
    import com.google.gson.Gson

    fun makeRequest() {
        val gson = Gson()
        val params = mutableMapOf<String, String>()
        val url = URL("http://test.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        val requestBody = mapOf(
            "key" to "value",
            "number" to "42"
        )
        val jsonBody = gson.toJson(requestBody)
        connection.setRequestProperty("Content-Type", "application/json")
        connection.outputStream.use { os ->
            os.write(jsonBody.toByteArray())
        }
        val response = connection.inputStream.bufferedReader().use { it.readText() }
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

    test("should return correct kotlin code with provided query parameters", () => {
        const options = {
            url: "http://test.com",
            query: {
                param1: "value1",
                param2: ["value2", "value3"],
            },
        };
        const expectedCode = `
    import java.net.URL
    import java.net.HttpURLConnection
    import com.google.gson.Gson

    fun makeRequest() {
        val gson = Gson()
        val params = mutableMapOf<String, String>()
        params["param1"] = "value1"
        params["param2"] = "value2"
        params["param2"] = "value3"
        val url = URL("http://test.com?\${params.entries.joinToString("&") { "\${it.key}=\${it.value}" }}")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        val response = connection.inputStream.bufferedReader().use { it.readText() }
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
