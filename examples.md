# Code Examples

## Clojure (POST)

```Clojure
(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (let [options {:url "http://example.com"
         :method :post
         :headers {"Content-Type":"application/json"}
         :body {"name" "John Doe"}}]
    (let [response (client/request options)]
      response)))
```

## Clojure (GET)

```Clojure
(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (let [options {:url "http://example.com"
         :query {"foo":"bar"}
         :method :get}]
    (let [response (client/request options)]
      response)))
```

## C# (POST)

```CSharp
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;

public class Program {
    public static async Task Main(string[] args) {
        using var client = new HttpClient();
        var requestData = new {
            name = "John Doe"
        };

        var request = new HttpRequestMessage {
            Method = new HttpMethod("POST"),
            RequestUri = new Uri("http://example.com")
        };
        request.Headers.Add("Content-Type", "application/json");
        
        var jsonOptions = new JsonSerializerOptions { 
        };
        request.Content = new StringContent(
            JsonSerializer.Serialize(requestData, jsonOptions),
            System.Text.Encoding.UTF8,
            "application/json"
        );
        
        try {
            using var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();            
        } catch (Exception ex) {
            Console.WriteLine(ex.ToString());
        }
    }
}
```

## C# (GET)

```CSharp
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;

public class Program {
    public static async Task Main(string[] args) {
        using var client = new HttpClient();
        var request = new HttpRequestMessage {
            Method = new HttpMethod("GET"),
            RequestUri = new Uri("http://example.com")
        };
        
        
        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        query["foo"] = "bar";
        request.RequestUri = new Uri(request.RequestUri + "?" + query);
        try {
            using var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();            
        } catch (Exception ex) {
            Console.WriteLine(ex.ToString());
        }
    }
}
```

## curl (POST)

```Curl
curl -X POST 'http://example.com' -H 'Content-Type: application/json' -d '{"name":"John Doe"}'
```

## curl (GET)

```Curl
curl -X GET 'http://example.com?foo=bar'
```

## Dart (POST)

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

## Dart (GET)

```Dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    var url = Uri.parse('http://example.com');
    var queryParameters = {"foo":"bar"};
    url = url.replace(queryParameters: queryParameters);
    var response = await http.get(url);
    if (response.statusCode != 200) {
        throw Exception('Failed to load data');
    }
}
```

## Elixir (POST)

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

## Elixir (GET)

```Elixir

    defmodule Example do
      require HTTPoison

      def request do
        headers = {}
        params = {"foo":"bar"}
        body = 
        method = :get
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

## Go (POST)

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

## Go (GET)

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
    method := "GET"

    client := &http.Client {
    }
    var req *http.Request
    var err error

    if method == "POST" || method == "PUT" {
        var jsonStr = []byte(``)
        req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonStr))
    } else {
        req, err = http.NewRequest(method, url, nil)
    }

    if err != nil {
        fmt.Println(err)
        return
    }

    

    params := url.Values{}
    params.Add("foo", "bar")
    req.URL.RawQuery = params.Encode()

    res, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer res.Body.Close()
}

```

## Java (POST)

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

## Java (GET)

```Java
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        URL url = new URL("http://example.com");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setDoOutput(true);
        
        
        if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
            throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
        }
        conn.disconnect();
    }
}
```

## JavaScript (POST)

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

## JavaScript (GET)

```JavaScript
fetch('http://example.com?foo=bar', {
method: 'GET',
})
.catch(error => console.error('Error:', error));
```

## Kotlin (POST)

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

## Kotlin (GET)

```Kotlin

    import java.net.URL
    import java.net.HttpURLConnection
    import java.io.OutputStreamWriter

    fun makeRequest() {
        val url = URL("http://example.com")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"


        val responseCode = connection.responseCode
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw RuntimeException("HTTP error code: $responseCode")
        }
    }
    
```

## Node (HTTP) (POST)

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

## Node (HTTP) (GET)

```NodeHTTP
const http = require('http');
const querystring = require('querystring');

const options = {
    hostname: 'example.com',
    port: 80,
    path: '/?foo=bar',
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


req.end();
```

## Node (Axios) (POST)

```NodeAxios
const axios = require('axios');

axios({ method: 'POST', url: 'http://example.com', headers: {"Content-Type":"application/json"}, data: {"name":"John Doe"} })
.then(function (response) {
    // do something with the response...
}).catch(function (error) {
    console.error(error);
});
```

## Node (Axios) (GET)

```NodeAxios
const axios = require('axios');

axios({ method: 'GET', url: 'http://example.com', params: {"foo":"bar"} })
.then(function (response) {
    // do something with the response...
}).catch(function (error) {
    console.error(error);
});
```

## Node (Fetch) (POST)

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

## Node (Fetch) (GET)

```NodeFetch
const fetch = require('node-fetch');
const querystring = require('querystring');

fetch('http://example.com?' + querystring.stringify({"foo":"bar"}), {
    method: 'GET',
    headers: {},
    body: ''
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

## Objective-C (POST)

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

## Objective-C (GET)

```ObjectiveC

    #import <Foundation/Foundation.h>

    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://example.com"]
        cachePolicy:NSURLRequestUseProtocolCachePolicy
        timeoutInterval:10.0];
    NSArray *requestHeaders = [@"",];
    NSArray *requestHeaderValues = [@"",];
    for (int i = 0; i < [requestHeaders count]; i++) {
        [request addValue:requestHeaderValues[i] forHTTPHeaderField:requestHeaders[i]];
    }
    [request setHTTPMethod:@"GET"];
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request
        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            if (error) {
                NSLog(@"%@", error);
            }
        }];
    [dataTask resume];
    
```

## PHP (POST)

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

## PHP (GET)

```PHP
<?php

$method = 'GET';
$url = 'http://example.com';
$query = http_build_query({"foo":"bar"});
$url .= '?' . $query;
$options = [
    'http' => [
        'method' => $method,
    ],
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) { /* Handle error */ }

?>
```

## PHP (Guzzle) (POST)

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

## PHP (Guzzle) (GET)

```PHPGuzzle
<?php
require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

try {
    $response = $client->request('GET', 'http://example.com', [
        'query' => [
            'foo' => 'bar',
        ],
    ]);
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo 'Request failed: ' . $e->getMessage();
}
?>
```

## PHP (Requests) (POST)

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

## PHP (Requests) (GET)

```PHPRequests
<?php
require 'vendor/autoload.php';
$headers = {};
$query = {"foo":"bar"};
$body = "";
$method = 'GET';
$url = 'http://example.com';

$response = Requests::request($url, $headers, $body, $method, $query);
if ($response->status_code >= 400) {
    throw new Exception('Server responded with status code ' . $response->status_code);
}
?>
```

## Python (POST)

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

## Python (GET)

```Python
import requests

def call_api():
    url = "http://example.com"
    params = {"foo":"bar"}
    method = "GET"
    headers = None
    data = None
    response = requests.request(method, url, headers=headers, params=params, data=data)
    if response.status_code != 200:
        raise Exception(f"Request failed with status {response.status_code}")

```

## Python (Requests) (POST)

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

## Python (Requests) (GET)

```PythonRequests
import requests

def send_request():
    url = "http://example.com"
    params = {"foo":"bar"}
    method = "GET"
    headers = None
    data = None
    response = requests.request(method, url, headers=headers, params=params, data=data)
    if response.status_code != 200:
        raise Exception("Request failed with status: " + str(response.status_code))
send_request()

```

## Ruby (POST)

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

## Ruby (GET)

```Ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse("http://example.com")
uri.query = "foo=#{bar}"
http = Net::HTTP.new(uri.host, uri.port)
request = Net::HTTP::GET.new(uri.request_uri)
response = http.request(request)
if response.code.to_i >= 400
  raise "HTTP Error: #{response.code}"
end

```

## Rust (POST)

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

## Rust (GET)

```Rust
use std::collections::HashMap;
use reqwest::{Client, Method, Url, header};

pub async fn make_request() -> Result<(), reqwest::Error> {
    let client = Client::new();
    let mut url = Url::parse("http://example.com").unwrap();
    let mut params = HashMap::new();
    params.insert("foo", "bar");
    url.query_pairs_mut().extend_pairs(params.into_iter());
    let method = Method::from_bytes(b"GET").unwrap();
    let request = client.request(method, url);
    let response = request.send().await?;
    Ok(())
}
```

## Swift (POST)

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

## Swift (GET)

```Swift
import Foundation

var request = URLRequest(url: URL(string: "http://example.com")!,timeoutInterval: Double.infinity)
request.httpMethod = "GET"
var components = URLComponents(url: request.url!, resolvingAgainstBaseURL: false)!
components.queryItems = [URLQueryItem(name: "foo", value: "bar")]
request.url = components.url
let task = URLSession.shared.dataTask(with: request) { data, response, error in
  guard let data = data else {
    print(String(describing: error))
    return
  }
}
task.resume()

```

## Wget (POST)

```Wget
wget --post-data '{"name":"John Doe"}' --header 'Content-Type: application/json' 'http://example.com'
```

## Wget (GET)

```Wget
wget 'http://example.com?foo=bar'
```

