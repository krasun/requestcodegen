# Code Examples

## Clojure (POST)

```Clojure
(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (client/request
    {
     :url "http://example.com"
     :method :post
     :headers {"Content-Type" "application/json"}
     :body {"name" "John Doe"
              "baz" ["qux" "quix"]}}))

```

## Clojure (GET)

```Clojure
(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (client/request
    {
     :url "http://example.com"
     :query-params {"baz" ["qux" "quix"]
              "foo" "bar"}
     :method :get}))

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
            name = "John Doe",
            baz = new object[] {
                "qux",
                "quix"
            }
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
        query["baz"] = "qux";
        query["baz"] = "quix";
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
curl -X POST 'http://example.com' -H 'Content-Type: application/json' -d '{"name":"John Doe","baz":["qux","quix"]}'
```

## curl (GET)

```Curl
curl -X GET 'http://example.com?baz=qux,quix&foo=bar'
```

## Dart (POST)

```Dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    final url = Uri.parse('http://example.com');

    final options = {
        "name": "John Doe",
        "baz": [
            "qux",
            "quix"
        ]
    };

    final response = await http.post(
        url,
        headers: {
            "Content-Type": "application/json"
        },
        body: jsonEncode(options)
    );

    if (response.statusCode != 200) {
        throw Exception('Request failed with status: ${response.statusCode}');
    }

    // process response    
}
```

## Dart (GET)

```Dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    final url = Uri.parse('http://example.com');
    final queryParameters = {
        "baz": [
            "qux",
            "quix"
        ],
        "foo": "bar"
    };
    final urlWithQuery = url.replace(queryParameters: queryParameters);

    final response = await http.get(
        urlWithQuery
    );

    if (response.statusCode != 200) {
        throw Exception('Request failed with status: ${response.statusCode}');
    }

    // process response    
}
```

## Elixir (POST)

```Elixir
defmodule Example do
  use HTTPoison.Base

  def request do
    url = "http://example.com"
    headers = %{
    "Content-Type": "application/json"
  }
    params = %{}
    body = %{
    "name": "John Doe",
    "baz": ["qux","quix"]
  }

    response = HTTPoison.post!(url, body, headers, params: params)
  end
end
```

## Elixir (GET)

```Elixir
defmodule Example do
  use HTTPoison.Base

  def request do
    url = "http://example.com"
    headers = %{}
    params = %{
    "baz": ["qux","quix"],
    "foo": "bar"
  }
    body = nil

    response = HTTPoison.get!(url, headers, params: params)
  end
end
```

## Go (POST)

```Go
package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
    "net/url"
)

func main() {
    client := &http.Client{}
    
    url := "http://example.com"
    method := "POST"

    var req *http.Request
    var err error

    jsonBody := `{
    "name": "John Doe",
    "baz": [
        "qux",
        "quix"
    ]
}`
    req, err = http.NewRequest(method, url, bytes.NewBufferString(jsonBody))
    if err != nil {
        fmt.Println(err)
        return
    }

        req.Header.Add("Content-Type", "application/json")

    resp, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer resp.Body.Close()
}
```

## Go (GET)

```Go
package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
    "net/url"
)

func main() {
    client := &http.Client{}
    
    url := "http://example.com"
    method := "GET"

    var req *http.Request
    var err error

    req, err = http.NewRequest(method, url, nil)
    if err != nil {
        fmt.Println(err)
        return
    }

    params := url.Values{}
        params.Add("baz", "qux")
        params.Add("baz", "quix")
        params.Add("foo", "bar")
    req.URL.RawQuery = params.Encode()

    resp, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer resp.Body.Close()
}
```

## Java (POST)

```Java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        Map<String, String> params = new LinkedHashMap<>();


        StringBuilder urlBuilder = new StringBuilder("http://example.com");
        if (!params.isEmpty()) {
            urlBuilder.append("?");
            boolean first = true;
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (!first) {
                    urlBuilder.append("&");
                }
                urlBuilder.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                urlBuilder.append("=");
                urlBuilder.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                first = false;
            }
        }

        HttpURLConnection conn = (HttpURLConnection) new URL(urlBuilder.toString()).openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");

        conn.setDoOutput(true);
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = String.format(
            {
                "name": "John Doe",
                "baz": [
                    "qux",
                    "quix"
                ]
            }
            ).getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                conn.getResponseCode() >= 400 ? conn.getErrorStream() : conn.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
        }
        conn.disconnect();
    }
}

```

## Java (GET)

```Java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        Map<String, String> params = new LinkedHashMap<>();
        params.add("baz", "qux");
        params.add("baz", "quix");
        params.add("foo", "bar");

        StringBuilder urlBuilder = new StringBuilder("http://example.com");
        if (!params.isEmpty()) {
            urlBuilder.append("?");
            boolean first = true;
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (!first) {
                    urlBuilder.append("&");
                }
                urlBuilder.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                urlBuilder.append("=");
                urlBuilder.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                first = false;
            }
        }

        HttpURLConnection conn = (HttpURLConnection) new URL(urlBuilder.toString()).openConnection();
        conn.setRequestMethod("GET");



        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                conn.getResponseCode() >= 400 ? conn.getErrorStream() : conn.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
        }
        conn.disconnect();
    }
}

```

## JavaScript (POST)

```JavaScript
const params = new URLSearchParams({
});

const requestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body:   {
      "name": "John Doe",
      "baz": [
          "qux",
          "quix"
      ]
  },
};

const response = await fetch('http://example.com' + '?' + params.toString(), requestOptions);

```

## JavaScript (GET)

```JavaScript
const params = new URLSearchParams({
  baz: 'qux',
  baz: 'quix',
  foo: 'bar'
});

const requestOptions = {
  method: 'GET',
};

const response = await fetch('http://example.com' + '?' + params.toString(), requestOptions);

```

## Kotlin (POST)

```Kotlin
import java.net.URL
import java.net.HttpURLConnection
import com.google.gson.Gson

fun makeRequest() {
    val gson = Gson()
    val params = mutableMapOf<String, String>()

    val url = URL("http://example.com")
    val connection = url.openConnection() as HttpURLConnection
    connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        val requestBody = mapOf(
            "name" to "John Doe",
            "baz" to "qux,quix"
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
```

## Kotlin (GET)

```Kotlin
import java.net.URL
import java.net.HttpURLConnection
import com.google.gson.Gson

fun makeRequest() {
    val gson = Gson()
    val params = mutableMapOf<String, String>()
        params["baz"] = "qux"
        params["baz"] = "quix"
        params["foo"] = "bar"
    val url = URL("http://example.com?${params.entries.joinToString("&") { "${it.key}=${it.value}" }}")
    val connection = url.openConnection() as HttpURLConnection
    connection.requestMethod = "GET"


    val response = connection.inputStream.bufferedReader().use { it.readText() }
    val responseCode = connection.responseCode
    if (responseCode != HttpURLConnection.HTTP_OK) {
        throw RuntimeException("HTTP error code: $responseCode")
    }
}
```

## Node (HTTP) (POST)

```NodeHTTP
const http = require('http');
const body = {
    name: "John Doe",
    baz: ["qux","quix"]
};

const options = {
    hostname: 'example.com',
    port: 80,
    path: '/',
    method: 'POST',
    headers: {"Content-Type":"application/json"}
};

let response = '';
const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
        response += chunk;
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(JSON.stringify(body));
req.end();
```

## Node (HTTP) (GET)

```NodeHTTP
const http = require('http');
const querystring = require('querystring');
const query = {
    baz: ["qux","quix"],
    foo: "bar"
};

const options = {
    hostname: 'example.com',
    port: 80,
    path: '/' + '?' + querystring.stringify(query),
    method: 'GET',
    headers: {}
};

let response = '';
const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
        response += chunk;
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
```

## Node (Axios) (POST)

```NodeAxios
const axios = require('axios');

axios({
    method: 'POST',
    url: 'http://example.com',
    headers: {
    "Content-Type": "application/json"
},
    data: {
    "body": {"name":"John Doe","baz":["qux","quix"]}
}
})
.then(response => response)
.catch(error => {
    throw error;
});
```

## Node (Axios) (GET)

```NodeAxios
const axios = require('axios');

axios({
    method: 'GET',
    url: 'http://example.com',
    params: {
    "baz": ["qux","quix"],
    "foo": "bar"
}
})
.then(response => response)
.catch(error => {
    throw error;
});
```

## Node (Fetch) (POST)

```NodeFetch
const fetch = require('node-fetch');

const params = {};
const url = 'http://example.com' + (Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '');

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: {
    "name": "John Doe",
    "baz": [
        "qux",
        "quix"
    ]
}
};

const response = await fetch(url, options);
const data = await response.json();
```

## Node (Fetch) (GET)

```NodeFetch
const fetch = require('node-fetch');

const params = {
    "baz": [
        "qux",
        "quix"
    ],
    "foo": "bar"
};
const url = 'http://example.com' + (Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '');

const options = {
    method: 'GET'
};

const response = await fetch(url, options);
const data = await response.json();
```

## Objective-C (POST)

```ObjectiveC
NSURL *url = [NSURL URLWithString:@"http://example.com"];

NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
[request setCachePolicy:NSURLRequestUseProtocolCachePolicy];
[request setTimeoutInterval:10.0];
[request setHTTPMethod:@"POST"];

NSDictionary *headers = @{
    @"Content-Type": @"application/json"
};

[headers enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSString *value, BOOL *stop) {
    [request setValue:value forHTTPHeaderField:key];
}];
NSDictionary *httpBody = @{
    @"name": @"John Doe",
    @"baz": @[@"qux", @"quix"]
};

NSData *httpBodyData = [NSJSONSerialization dataWithJSONObject:httpBody options:0 error:nil];
[request setHTTPBody:httpBodyData];

NSURLSession *session = [NSURLSession sharedSession];
NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
}];
[task resume];
```

## Objective-C (GET)

```ObjectiveC
NSURLComponents *components = [[NSURLComponents alloc] initWithString:@"http://example.com"];
NSMutableArray *queryItems = [NSMutableArray array];
[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"baz" value:@"qux"]];
[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"baz" value:@"quix"]];
[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"foo" value:@"bar"]];
[components setQueryItems:queryItems];
NSURL *url = [components URL];

NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
[request setCachePolicy:NSURLRequestUseProtocolCachePolicy];
[request setTimeoutInterval:10.0];
[request setHTTPMethod:@"GET"];


NSURLSession *session = [NSURLSession sharedSession];
NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
}];
[task resume];
```

## PHP (POST)

```PHP
<?php

$method = 'POST';
$url = 'http://example.com';

$options = [
    'http' => [
        'method' => $method,
        'header' => [
            'Content-Type: application/json',
        ],
        'content' => json_encode([
            'name' => "John Doe",
            'baz' => ["qux","quix"],
        ]),
    ],
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
```

## PHP (GET)

```PHP
<?php

$method = 'GET';
$url = 'http://example.com';
$query = [
    'baz' => ["qux","quix"],
    'foo' => "bar",
];
$url .= '?' . http_build_query($query);

$options = [
    'http' => [
        'method' => $method,
    ],
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
```

## PHP (Guzzle) (POST)

```PHPGuzzle
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

$requestOptions = [];

$requestOptions['headers'] = [
    'Content-Type' => 'application/json',
];

$requestOptions['json'] = [
    'name' => "John Doe",
    'baz' => ["qux","quix"],
];

try {
    $response = $client->request('POST', 'http://example.com', $requestOptions);
} catch (\GuzzleHttp\Exception\RequestException $e) {
    $error = $e->getMessage();
}
```

## PHP (Guzzle) (GET)

```PHPGuzzle
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

$requestOptions = [];

$requestOptions['query'] = [
    'baz[]' => 'qux',
    'baz[]' => 'quix',
    'foo' => 'bar',
];

try {
    $response = $client->request('GET', 'http://example.com', $requestOptions);
} catch (\GuzzleHttp\Exception\RequestException $e) {
    $error = $e->getMessage();
}
```

## PHP (Requests) (POST)

```PHPRequests
<?php
require 'vendor/autoload.php';

$url = 'http://example.com';
$method = 'POST';
$headers = [
    'Content-Type' => 'application/json'
];
$query = [];
$body = [
    'name' => 'John Doe',
    'baz' => ["qux","quix"]
];

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

$url = 'http://example.com';
$method = 'GET';
$headers = [];
$query = [
    'baz' => ["qux","quix"],
    'foo' => 'bar'
];
$body = [];

$response = Requests::request($url, $headers, $body, $method, $query);
if ($response->status_code >= 400) {
    throw new Exception('Server responded with status code ' . $response->status_code);
}
?>
```

## Python (POST)

```Python
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import json
import ssl

def call_api():
    url = "http://example.com"
    request = Request(url)
    request.method = "POST"
    request.add_header("Content-Type", "application/json")
    data = {
        "name": "John Doe",
        "baz": [
                "qux",
                "quix"
        ],
    }
    request.data = json.dumps(data).encode()
    ctx = ssl.create_default_context()
    try:
        response = urlopen(request, context=ctx)
    except HTTPError as e:
        response = e
        if response.code >= 400:
            raise
    return response

```

## Python (GET)

```Python
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import json
import ssl

def call_api():
    url = "http://example.com"
    query_params = {
        "baz": ["qux","quix"],
        "foo": "bar",
    }
    url = f"{url}?{urlencode(query_params)}"
    request = Request(url)
    request.method = "GET"
    ctx = ssl.create_default_context()
    try:
        response = urlopen(request, context=ctx)
    except HTTPError as e:
        response = e
        if response.code >= 400:
            raise
    return response

```

## Python (Requests) (POST)

```PythonRequests
import requests

def call_api():
    url = "http://example.com"
    params = None
    method = "POST"
    headers = {
        "Content-Type": "application/json",
    }
    data = {
        "name": "John Doe",
        "baz": ["qux","quix"],
    }
    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)

```

## Python (Requests) (GET)

```PythonRequests
import requests

def call_api():
    url = "http://example.com"
    params = {
        "baz": ["qux","quix"],
        "foo": "bar",
    }
    method = "GET"
    headers = None
    data = None
    response = requests.request(method, url, headers=headers, params=params, json=data if isinstance(data, dict) else data)

```

## Ruby (POST)

```Ruby
require 'net/http'
require 'uri'
require 'json'

def send_request
  uri = URI.parse("http://example.com")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'

  request = Net::HTTP::Post.new(uri.request_uri)

  request.initialize_http_header(
    "Content-Type" => "application/json"
  )

  body = {
    "name" => "John Doe",
    "baz" => ["qux","quix"]
  }
  request.body = body.to_json

  begin
    response = http.request(request)
    case response
    when Net::HTTPSuccess
      response
    else
      raise "HTTP Error: #{response.code} - #{response.message}"
    end
  rescue StandardError => e
    raise "Request failed: #{e.message}"
  end
end

send_request if __FILE__ == $PROGRAM_NAME

```

## Ruby (GET)

```Ruby
require 'net/http'
require 'uri'
require 'json'

def send_request
  uri = URI.parse("http://example.com")
  query_params = {
    "baz" => qux,quix,
    "foo" => bar
  }
  uri.query = URI.encode_www_form(query_params)

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'

  request = Net::HTTP::Get.new(uri.request_uri)

  begin
    response = http.request(request)
    case response
    when Net::HTTPSuccess
      response
    else
      raise "HTTP Error: #{response.code} - #{response.message}"
    end
  rescue StandardError => e
    raise "Request failed: #{e.message}"
  end
end

send_request if __FILE__ == $PROGRAM_NAME

```

## Rust (POST)

```Rust
use reqwest::{Client, Method};
use serde_json::Value;

pub async fn make_request() -> Result<reqwest::Response, reqwest::Error> {
    let client = Client::new();
    let mut url = "http://example.com".parse()?;
    let request = client.request(Method::POST, url)
        .headers(
        {
            "Content-Type": "application/json"
        }
            .into())
        .json(&serde_json::json!(
        {
            "body": {
                "name": "John Doe",
                "baz": [
                    "qux",
                    "quix"
                ]
            }
        }
        ))
        .send()
        .await?;
    Ok(response)
}
```

## Rust (GET)

```Rust
use reqwest::{Client, Method};
use serde_json::Value;

pub async fn make_request() -> Result<reqwest::Response, reqwest::Error> {
    let client = Client::new();
    let mut url = "http://example.com".parse()?;
    let query_params: Value = serde_json::json!(
    {
        "baz": [
            "qux",
            "quix"
        ],
        "foo": "bar"
    }
    );
    if let Value::Object(params) = query_params {
        let query_string = params.iter()
            .flat_map(|(k, v)| match v {
                Value::Array(arr) => arr.iter()
                    .map(|x| (k.clone(), x.to_string()))
                    .collect::<Vec<_>>(),
                _ => vec![(k.clone(), v.to_string())]
            })
            .collect::<Vec<_>>();
        url.query_pairs_mut().extend_pairs(query_string);
    }
    let request = client.request(Method::GET, url)
        .send()
        .await?;
    Ok(response)
}
```

## Swift (POST)

```Swift
import Foundation

var request = URLRequest(url: URL(string: "http://example.com")!,timeoutInterval: Double.infinity)
request.httpMethod = "POST"
request.addValue("application/json", forHTTPHeaderField: "Content-Type")
let parameters: [String: Any] = {
    "name": "John Doe",
    "baz": [
        "qux",
        "quix"
    ]
}
request.httpBody = try? JSONSerialization.data(withJSONObject: parameters)
request.addValue("application/json", forHTTPHeaderField: "Content-Type")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }
    let response = data
}
task.resume()

```

## Swift (GET)

```Swift
import Foundation

let components = URLComponents(string: "http://example.com")!
let queryItems: [URLQueryItem] = [
    URLQueryItem(name: "baz", value: "qux"),
    URLQueryItem(name: "baz", value: "quix"),
    URLQueryItem(name: "foo", value: "bar")
]
components.queryItems = queryItems

var request = URLRequest(url: components.url!,timeoutInterval: Double.infinity)
request.httpMethod = "GET"

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }
    let response = data
}
task.resume()

```

## Wget (POST)

```Wget
wget --post-data '{"name":"John Doe","baz":["qux","quix"]}' \
  --header 'Content-Type: application/json' \
  'http://example.com'
```

## Wget (GET)

```Wget
wget \
  'http://example.com?baz=qux&baz=quix&foo=bar'
```

