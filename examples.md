# Code Examples

## Clojure

```Clojure
(ns my.namespace
(:require [clj-http.client :as client]))

(defn make-request []
(let [options {:url "http://example.com"
:method :post
:headers {"Content-Type":"application/json"}
:body "{"name":"John Doe"}"}]
(client/request options))
```

## C#

```CSharp
using System;
using System.Net.Http;
using System.Threading.Tasks;

public class Program
{
    public static async Task Main(string[] args)
    {
        using (var client = new HttpClient())
        {
            var request = new HttpRequestMessage
            {
                Method = new HttpMethod("POST"),
                RequestUri = new Uri("http://example.com"),
            };

            request.Headers.Add("Content-Type", "application/json");

            request.Content = new StringContent("{"name":"John Doe"}");



            try
            {
                using (var response = await client.SendAsync(request))
                {
                    response.EnsureSuccessStatusCode();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
```

## curl

```Curl
curl -X POST 'http://example.com' -H 'Content-Type: application/json' -d '{"name":"John Doe"}'
```

## Dart

```Dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    var url = Uri.parse('http://example.com');
    var response = await http.post(url, headers: {"Content-Type":"application/json"}, body: '{"name":"John Doe"}');
    if (response.statusCode != 200) {
        throw Exception('Failed to load data');
    }
}
```

## Elixir

```Elixir

    defmodule Example do
      require HTTPoison

      def request do
        headers = {"Content-Type":"application/json"}
        params = {}
        body = "{"name":"John Doe"}"
        method = :post
        url = "http://example.com"

        case method do
          :get -> HTTPoison.get(url, headers, params: params)
          :post -> HTTPoison.post(url, body, headers, params: params)
          :put -> HTTPoison.put(url, body, headers, params: params)
          _ -> {:error, "Invalid method"}
        end
      end
    end

```

## Go

```Go
package main

import (
    "bytes"
    "fmt"
    "net/http"
    "net/url"
)

func main() {
    url := "http://example.com"
    method := "POST"

    client := &http.Client {
    }
    var req *http.Request
    var err error

    if method == "POST" || method == "PUT" {
        var jsonStr = []byte(`{"name":"John Doe"}`)
        req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonStr))
    } else {
        req, err = http.NewRequest(method, url, nil)
    }

    if err != nil {
        fmt.Println(err)
        return
    }

    req.Header.Add("Content-Type", "application/json")



    res, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer res.Body.Close()
}

```

## Java

```Java
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        URL url = new URL("http://example.com");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("Content-Type", "application/json");
        String input = "{"name":"John Doe"}";
        OutputStream os = conn.getOutputStream();
        os.write(input.getBytes());
        os.flush();
        if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
            throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
        }
        conn.disconnect();
    }
}
```

## JavaScript

```JavaScript
fetch('http://example.com', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: '{"name":"John Doe"}',
})
.catch(error => console.error('Error:', error));
```

## Kotlin

```Kotlin

    import java.net.URL
    import java.net.HttpURLConnection
    import java.io.OutputStreamWriter

    fun makeRequest() {
        val url = URL("http://example.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
connection.setRequestProperty("Content-Type", "application/json")
        val out = OutputStreamWriter(connection.outputStream)
        out.write("{"name":"John Doe"}")
        out.close()
        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw RuntimeException("HTTP error code: $responseCode")
        }
    }

```

## Node (HTTP)

```NodeHTTP
const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: 'example.com',
    port: 80,
    path: '/',
    method: 'POST',
    headers: {"Content-Type":"application/json"}
};

const req = http.request(options, (res) => {
    res.on('data', (chunk) => {});
    res.on('end', () => {});
});

req.on('error', (error) => {
    console.error(error);
});

req.write('{"name":"John Doe"}');
req.end();
```

## Node (Axios)

```NodeAxios
const axios = require('axios');

axios({ method: 'POST', url: 'http://example.com', headers: {"Content-Type":"application/json"}, data: {"name":"John Doe"} })
.then(function (response) {
    // do something with the response...
}).catch(function (error) {
    console.error(error);
});
```

## Node (Fetch)

```NodeFetch
const fetch = require('node-fetch');
const querystring = require('querystring');

fetch('http://example.com', {
    method: 'POST',
    headers: {"Content-Type":"application/json"},
    body: '{"name":"John Doe"}'
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
})
.catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
});
```

## Objective-C

```ObjectiveC

    #import <Foundation/Foundation.h>

    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://example.com"]
        cachePolicy:NSURLRequestUseProtocolCachePolicy
        timeoutInterval:10.0];
    NSArray *requestHeaders = [@"Content-Type",];
    NSArray *requestHeaderValues = [@"application/json",];
    for (int i = 0; i < [requestHeaders count]; i++) {
        [request addValue:requestHeaderValues[i] forHTTPHeaderField:requestHeaders[i]];
    }
    [request setHTTPMethod:@"POST"];

        NSString *httpBodyString = @"{"name":"John Doe"}";
        [request setHTTPBody:[httpBodyString dataUsingEncoding:NSUTF8StringEncoding]];

    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request
        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            if (error) {
                NSLog(@"%@", error);
            }
        }];
    [dataTask resume];

```

## PHP

```PHP
<?php

$method = 'POST';
$url = 'http://example.com';
$options = [
    'http' => [
        'method' => $method,
        'header' => {"Content-Type":"application/json"},
        'content' => '{"name":"John Doe"}',
    ],
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) { /* Handle error */ }

?>
```

## PHP (Guzzle)

```PHPGuzzle
<?php
require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

try {
    $response = $client->request('POST', 'http://example.com', [
        'headers' => [
            'Content-Type' => 'application/json',
        ],
        'body' => '{"name":"John Doe"}',
    ]);
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo 'Request failed: ' . $e->getMessage();
}
?>
```

## PHP (Requests)

```PHPRequests
<?php
require 'vendor/autoload.php';
$headers = {"Content-Type":"application/json"};
$query = {};
$body = {"name":"John Doe"};
$method = 'POST';
$url = 'http://example.com';

$response = Requests::request($url, $headers, $body, $method, $query);
if ($response->status_code >= 400) {
    throw new Exception('Server responded with status code ' . $response->status_code);
}
?>
```

## Python

```Python
import requests

def call_api():
    url = "http://example.com"
    params = None
    method = "POST"
    headers = {"Content-Type":"application/json"}
    data = '{"name":"John Doe"}'
    response = requests.request(method, url, headers=headers, params=params, data=data)
    if response.status_code != 200:
        raise Exception(f"Request failed with status {response.status_code}")

```

## Python (Requests)

```PythonRequests
import requests

def send_request():
    url = "http://example.com"
    params = None
    method = "POST"
    headers = {"Content-Type":"application/json"}
    data = '''{"name":"John Doe"}'''
    response = requests.request(method, url, headers=headers, params=params, data=data)
    if response.status_code != 200:
        raise Exception("Request failed with status: " + str(response.status_code))
send_request()

```

## Ruby

```Ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse("http://example.com")
http = Net::HTTP.new(uri.host, uri.port)
request = Net::HTTP::POST.new(uri.request_uri)
request["Content-Type"] = "application/json"
request.body = '{"name":"John Doe"}'
response = http.request(request)
if response.code.to_i >= 400
  raise "HTTP Error: #{response.code}"
end

```

## Rust

```Rust
use std::collections::HashMap;
use reqwest::{Client, Method, Url, header};

pub async fn make_request() -> Result<(), reqwest::Error> {
    let client = Client::new();
    let mut url = Url::parse("http://example.com").unwrap();
    let method = Method::from_bytes(b"POST").unwrap();
    let mut headers = header::HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());
    let request = client.request(method, url);
    request.body("{"name":"John Doe"}");
    let response = request.send().await?;
    Ok(())
}
```

## Swift

```Swift
import Foundation

var request = URLRequest(url: URL(string: "http://example.com")!,timeoutInterval: Double.infinity)
request.httpMethod = "POST"
request.addValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = "{"name":"John Doe"}".data(using: .utf8)
let task = URLSession.shared.dataTask(with: request) { data, response, error in
  guard let data = data else {
    print(String(describing: error))
    return
  }
}
task.resume()

```

## Wget

```Wget
wget --post-data '{"name":"John Doe"}' --header 'Content-Type: application/json' 'http://example.com'
```
