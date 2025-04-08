import { generatePHPGuzzleCode } from "./php-guzzle";
import { JsonBody } from "../request";

describe("generatePHPGuzzleCode", () => {
    test("generates code for GET request", () => {
        const code = generatePHPGuzzleCode({
            method: "GET",
            url: "https://api.example.com/users",
        });
        expect(code).toBe(`<?php

require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();

$requestOptions = [];

try {
    $response = $client->request('GET', 'https://api.example.com/users', $requestOptions);
} catch (\\GuzzleHttp\\Exception\\RequestException $e) {
    $error = $e->getMessage();
}`);
    });

    test("generates code for POST request with JSON body", () => {
        const code = generatePHPGuzzleCode({
            method: "POST",
            url: "https://api.example.com/users",
            body: new JsonBody({ name: "John", age: 30 }),
        });
        expect(code).toBe(`<?php

require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();

$requestOptions = [];

$requestOptions['json'] = [
    'name' => "John",
    'age' => 30,
];

try {
    $response = $client->request('POST', 'https://api.example.com/users', $requestOptions);
} catch (\\GuzzleHttp\\Exception\\RequestException $e) {
    $error = $e->getMessage();
}`);
    });

    test("generates code for PUT request with headers", () => {
        const code = generatePHPGuzzleCode({
            method: "PUT",
            url: "https://api.example.com/users/1",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer token123",
            },
            body: new JsonBody({ name: "Updated John" }),
        });
        expect(code).toBe(`<?php

require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();

$requestOptions = [];

$requestOptions['headers'] = [
    'Content-Type' => 'application/json',
    'Authorization' => 'Bearer token123',
];

$requestOptions['json'] = [
    'name' => "Updated John",
];

try {
    $response = $client->request('PUT', 'https://api.example.com/users/1', $requestOptions);
} catch (\\GuzzleHttp\\Exception\\RequestException $e) {
    $error = $e->getMessage();
}`);
    });

    test("generates code for DELETE request", () => {
        const code = generatePHPGuzzleCode({
            method: "DELETE",
            url: "https://api.example.com/users/1",
        });
        expect(code).toBe(`<?php

require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();

$requestOptions = [];

try {
    $response = $client->request('DELETE', 'https://api.example.com/users/1', $requestOptions);
} catch (\\GuzzleHttp\\Exception\\RequestException $e) {
    $error = $e->getMessage();
}`);
    });

    test("generates code for PATCH request with query parameters", () => {
        const code = generatePHPGuzzleCode({
            method: "PATCH",
            url: "https://api.example.com/users/1",
            query: {
                version: "2",
                fields: ["name", "email"],
            },
            body: new JsonBody({ status: "inactive" }),
        });
        expect(code).toBe(`<?php

require 'vendor/autoload.php';

$client = new \\GuzzleHttp\\Client();

$requestOptions = [];

$requestOptions['query'] = [
    'version' => '2',
    'fields[]' => 'name',
    'fields[]' => 'email',
];

$requestOptions['json'] = [
    'status' => "inactive",
];

try {
    $response = $client->request('PATCH', 'https://api.example.com/users/1', $requestOptions);
} catch (\\GuzzleHttp\\Exception\\RequestException $e) {
    $error = $e->getMessage();
}`);
    });
});
