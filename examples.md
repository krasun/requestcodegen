# Code Examples

## Clojure (GET)

```Clojure
(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (client/request
    {
     :url "https://example.com"
     :query-params {"baz" ["qux" "quix"]
              "foo" "bar"}
     :method :get}))

```

## Clojure (POST)

```Clojure
(ns my.namespace
  (:require [clj-http.client :as client]))

(defn make-request []
  (client/request
    {
     :url "https://example.com"
     :method :post
     :headers {"Content-Type" "application/json"}
     :body "{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}"}))

```

## C# (GET)

```CSharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

public class Program {
    public static async Task Main(string[] args) {
        using var client = new HttpClient();

        var query = HttpUtility.ParseQueryString(string.Empty);
        query.Add("baz", "qux");
        query.Add("baz", "quix");
        query.Add("foo", "bar");

        var request = new HttpRequestMessage {
            Method = new HttpMethod("GET"),
            RequestUri = new Uri("https://example.com?" + query)
        };

        using var response = await client.SendAsync(request);
    }
}
```

## C# (POST)

```CSharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

public class Program {
    public static async Task Main(string[] args) {
        using var client = new HttpClient();

        var request = new HttpRequestMessage {
            Method = new HttpMethod("POST"),
            RequestUri = new Uri("https://example.com?" + query)
        };

        request.Content = new StringContent("{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}", Encoding.UTF8);
        request.Content.Headers.Remove("Content-Type");
        request.Content.Headers.TryAddWithoutValidation("Content-Type", "application/json");

        using var response = await client.SendAsync(request);
    }
}
```

## curl (GET)

```Curl
curl 'https://example.com?baz=qux&baz=quix&foo=bar'
```

## curl (POST)

```Curl
curl 'https://example.com' \
  -H 'Content-Type: application/json' \
  -d '{"name":"John Doe","baz":["qux","quix"]}'
```

## Dart (GET)

```Dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    final url = Uri.parse('https://example.com');
    final queryParameters = {
            'baz': ['qux', 'quix'],
            'foo': 'bar',
        };
    final urlWithQuery = url.replace(queryParameters: queryParameters);

    final response = await http.get(urlWithQuery);
}
```

## Dart (POST)

```Dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> request() async {
    final url = Uri.parse('https://example.com');

    final request = http.Request('POST', url);
    request.headers.addAll({
        'Content-Type': 'application/json',
    });
    request.bodyBytes = utf8.encode('{"name":"John Doe","baz":["qux","quix"]}');

    final response = await http.Response.fromStream(await request.send());
}
```

## Elixir (GET)

```Elixir
defmodule Example do
  def request do
    url = "https://example.com"
    headers = []
    params = [
      {"baz", "qux"},
      {"baz", "quix"},
      {"foo", "bar"}
    ]
    body = ""

    response = HTTPoison.request!(:get, url, body, headers, params: params)
  end
end
```

## Elixir (POST)

```Elixir
defmodule Example do
  def request do
    url = "https://example.com"
    headers = [
      {"Content-Type", "application/json"}
    ]
    params = []
    body = "{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}"

    response = HTTPoison.request!(:post, url, body, headers, params: params)
  end
end
```

## Go (GET)

```Go
package main

import (
    "fmt"
    "net/http"
    "net/url"
    "strings"
)

func main() {
    client := &http.Client{}

    req, err := http.NewRequest("GET", "https://example.com", nil)
    if err != nil {
        fmt.Println(err)
        return
    }

    params := []string{
        url.QueryEscape("baz") + "=" + url.QueryEscape("qux"),
        url.QueryEscape("baz") + "=" + url.QueryEscape("quix"),
        url.QueryEscape("foo") + "=" + url.QueryEscape("bar"),
    }
    req.URL.RawQuery = strings.Join(params, "&")

    resp, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer resp.Body.Close()
}
```

## Go (POST)

```Go
package main

import (
    "fmt"
    "net/http"
    "strings"
)

func main() {
    client := &http.Client{}

    body := strings.NewReader("{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}")
    req, err := http.NewRequest("POST", "https://example.com", body)
    if err != nil {
        fmt.Println(err)
        return
    }

    req.Header.Set("Content-Type", "application/json")

    resp, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer resp.Body.Close()
}
```

## Java (GET)

```Java
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

public class Main {
    public static void main(String[] args) throws Exception {
        List<String[]> params = new ArrayList<>();
        params.add(new String[] {"baz", "qux"});
        params.add(new String[] {"baz", "quix"});
        params.add(new String[] {"foo", "bar"});

        StringJoiner query = new StringJoiner("&");
        for (String[] param : params) {
            query.add(URLEncoder.encode(param[0], StandardCharsets.UTF_8) + "=" + URLEncoder.encode(param[1], StandardCharsets.UTF_8));
        }

        URL url = new URL("https://example.com?" + query);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");

        int responseCode = conn.getResponseCode();
        InputStream response = responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
    }
}

```

## Java (POST)

```Java
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

public class Main {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://example.com");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");

        conn.setDoOutput(true);
        try (OutputStream os = conn.getOutputStream()) {
            os.write("{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}".getBytes(StandardCharsets.UTF_8));
        }

        int responseCode = conn.getResponseCode();
        InputStream response = responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
    }
}

```

## JavaScript (GET)

```JavaScript
const params = new URLSearchParams([
    ["baz", "qux"],
    ["baz", "quix"],
    ["foo", "bar"],
]);

const response = await fetch("https://example.com?" + params);
```

## JavaScript (POST)

```JavaScript
const response = await fetch("https://example.com", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "John Doe",
        baz: ["qux", "quix"],
    }),
});
```

## Kotlin (GET)

```Kotlin
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

fun makeRequest() {
    val params = listOf(
        "baz" to "qux",
        "baz" to "quix",
        "foo" to "bar",
    )
    val query = params.joinToString("&") { (key, value) -> URLEncoder.encode(key, "UTF-8") + "=" + URLEncoder.encode(value, "UTF-8") }
    val url = URL("https://example.com?" + query)
    val connection = url.openConnection() as HttpURLConnection
    connection.requestMethod = "GET"
    val response = (if (connection.responseCode >= 400) connection.errorStream else connection.inputStream)?.bufferedReader()?.use { it.readText() }
}
```

## Kotlin (POST)

```Kotlin
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

fun makeRequest() {
    val url = URL("https://example.com")
    val connection = url.openConnection() as HttpURLConnection
    connection.requestMethod = "POST"
    connection.setRequestProperty("Content-Type", "application/json")
    connection.doOutput = true
    connection.outputStream.use { os ->
        os.write("{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}".toByteArray(Charsets.UTF_8))
    }
    val response = (if (connection.responseCode >= 400) connection.errorStream else connection.inputStream)?.bufferedReader()?.use { it.readText() }
}
```

## Node (HTTP) (GET)

```NodeHTTP
const https = require("https");

const url = new URL("https://example.com");
url.searchParams.append("baz", "qux");
url.searchParams.append("baz", "quix");
url.searchParams.append("foo", "bar");

const options = {
    method: "GET",
};

const req = https.request(url, options, (response) => {
    response.resume();
});

req.on("error", (error) => {
    console.error(error);
});
req.end();
```

## Node (HTTP) (POST)

```NodeHTTP
const https = require("https");

const url = new URL("https://example.com");

const body = "{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}";

const options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
};

const req = https.request(url, options, (response) => {
    response.resume();
});

req.on("error", (error) => {
    console.error(error);
});

req.write(body);
req.end();
```

## Node (Axios) (GET)

```NodeAxios
import axios from "axios";

const response = await axios({
    url: "https://example.com",
    params: {
        baz: ["qux", "quix"],
        foo: "bar",
    },
    paramsSerializer: {
        indexes: null,
    },
});
```

## Node (Axios) (POST)

```NodeAxios
import axios from "axios";

const response = await axios({
    method: "POST",
    url: "https://example.com",
    headers: {
        "Content-Type": "application/json",
    },
    data: {
        name: "John Doe",
        baz: ["qux", "quix"],
    },
});
```

## Node (Fetch) (GET)

```NodeFetch
const params = new URLSearchParams([
    ["baz", "qux"],
    ["baz", "quix"],
    ["foo", "bar"],
]);

const response = await fetch("https://example.com?" + params);
```

## Node (Fetch) (POST)

```NodeFetch
const response = await fetch("https://example.com", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "John Doe",
        baz: ["qux", "quix"],
    }),
});
```

## Objective-C (GET)

```ObjectiveC
NSURLComponents *components = [[NSURLComponents alloc] initWithString:@"https://example.com"];
NSMutableArray *queryItems = [NSMutableArray array];
[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"baz" value:@"qux"]];
[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"baz" value:@"quix"]];
[queryItems addObject:[[NSURLQueryItem alloc] initWithName:@"foo" value:@"bar"]];
[components setQueryItems:queryItems];
NSURL *url = [components URL];

NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
[request setHTTPMethod:@"GET"];

NSURLSession *session = [NSURLSession sharedSession];
NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
}];
[task resume];
```

## Objective-C (POST)

```ObjectiveC
NSURL *url = [NSURL URLWithString:@"https://example.com"];

NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
[request setHTTPMethod:@"POST"];
[request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
[request setHTTPBody:[@"{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}" dataUsingEncoding:NSUTF8StringEncoding]];

NSURLSession *session = [NSURLSession sharedSession];
NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
}];
[task resume];
```

## PHP (GET)

```PHP
<?php

$method = 'GET';
$url = 'https://example.com';
$query = [
    'baz' => ['qux', 'quix'],
    'foo' => 'bar',
];
$url .= '?' . preg_replace('/%5B\d+%5D=/', '=', http_build_query($query));

$options = [
    'http' => [
        'method' => $method,
        'ignore_errors' => true,
    ],
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
```

## PHP (POST)

```PHP
<?php

$method = 'POST';
$url = 'https://example.com';

$options = [
    'http' => [
        'method' => $method,
        'header' => [
            'Content-Type: application/json',
        ],
        'content' => '{"name":"John Doe","baz":["qux","quix"]}',
        'ignore_errors' => true,
    ],
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
```

## PHP (cURL) (GET)

```PHPCurl
<?php

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://example.com?baz=qux&baz=quix&foo=bar',
    CURLOPT_RETURNTRANSFER => true,
]);

$response = curl_exec($ch);
```

## PHP (cURL) (POST)

```PHPCurl
<?php

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://example.com',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => '{"name":"John Doe","baz":["qux","quix"]}',
]);

$response = curl_exec($ch);
```

## PHP (Guzzle) (GET)

```PHPGuzzle
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://example.com', [
    'query' => \GuzzleHttp\Psr7\Query::build([
        'baz' => ['qux', 'quix'],
        'foo' => 'bar',
    ]),
]);
```

## PHP (Guzzle) (POST)

```PHPGuzzle
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://example.com', [
    'headers' => [
        'Content-Type' => 'application/json',
    ],
    'body' => '{"name":"John Doe","baz":["qux","quix"]}',
]);
```

## PHP (Requests) (GET)

```PHPRequests
<?php

require 'vendor/autoload.php';

$url = 'https://example.com';
$query = [
    'baz' => ['qux', 'quix'],
    'foo' => 'bar',
];
$url .= '?' . preg_replace('/%5B\d+%5D=/', '=', http_build_query($query));
$headers = [];
$body = [];

$response = \WpOrg\Requests\Requests::request($url, $headers, $body, 'GET');
```

## PHP (Requests) (POST)

```PHPRequests
<?php

require 'vendor/autoload.php';

$url = 'https://example.com';
$headers = [
    'Content-Type' => 'application/json',
];
$body = '{"name":"John Doe","baz":["qux","quix"]}';

$response = \WpOrg\Requests\Requests::request($url, $headers, $body, 'POST');
```

## Python (GET)

```Python
from urllib.parse import urlencode
from urllib.request import Request, urlopen

def call_api():
    url = "https://example.com"
    query_params = {
        "baz": ["qux", "quix"],
        "foo": "bar",
    }
    url = url + "?" + urlencode(query_params, doseq=True)
    request = Request(url, data=None, method="GET")
    response = urlopen(request)
    return response

```

## Python (POST)

```Python
from urllib.request import Request, urlopen

def call_api():
    url = "https://example.com"
    request = Request(url, data='{"name":"John Doe","baz":["qux","quix"]}'.encode(), method="POST")
    request.add_header("Content-Type", "application/json")
    response = urlopen(request)
    return response

```

## Python (Requests) (GET)

```PythonRequests
import requests

params = {
    "baz": ["qux", "quix"],
    "foo": "bar",
}

response = requests.get(
    "https://example.com",
    params=params,
)
```

## Python (Requests) (POST)

```PythonRequests
import requests

headers = {
    "Content-Type": "application/json",
}

data = '{"name":"John Doe","baz":["qux","quix"]}'

response = requests.post(
    "https://example.com",
    headers=headers,
    data=data,
)
```

## Ruby (GET)

```Ruby
require 'net/http'
require 'uri'

def send_request
  uri = URI.parse("https://example.com")
  query_params = {
    "baz" => ["qux", "quix"],
    "foo" => "bar"
  }
  uri.query = URI.encode_www_form(query_params)

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'

  request = Net::HTTPGenericRequest.new("GET", false, true, uri.request_uri)

  response = http.request(request)
end

```

## Ruby (POST)

```Ruby
require 'net/http'
require 'uri'

def send_request
  uri = URI.parse("https://example.com")

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'

  request = Net::HTTPGenericRequest.new("POST", true, true, uri.request_uri)
  request["Content-Type"] = "application/json"
  request.body = "{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}"

  response = http.request(request)
end

```

## Rust (GET)

```Rust
pub async fn make_request() -> Result<reqwest::Response, reqwest::Error> {
    let client = reqwest::Client::new();
    let method = reqwest::Method::from_bytes("GET".as_bytes()).unwrap();
    let response = client
        .request(method, "https://example.com")
        .query(&[
            ("baz", "qux"),
            ("baz", "quix"),
            ("foo", "bar"),
        ])
        .send()
        .await?;
    Ok(response)
}
```

## Rust (POST)

```Rust
pub async fn make_request() -> Result<reqwest::Response, reqwest::Error> {
    let client = reqwest::Client::new();
    let method = reqwest::Method::from_bytes("POST".as_bytes()).unwrap();
    let response = client
        .request(method, "https://example.com")
        .header("Content-Type", "application/json")
        .body("{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}")
        .send()
        .await?;
    Ok(response)
}
```

## Swift (GET)

```Swift
import Foundation

var components = URLComponents(string: "https://example.com")!
components.queryItems = [
    URLQueryItem(name: "baz", value: "qux"),
    URLQueryItem(name: "baz", value: "quix"),
    URLQueryItem(name: "foo", value: "bar")
]

var request = URLRequest(url: components.url!)
request.httpMethod = "GET"

let (data, response) = try await URLSession.shared.data(for: request)

```

## Swift (POST)

```Swift
import Foundation

var request = URLRequest(url: URL(string: "https://example.com")!)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = "{\"name\":\"John Doe\",\"baz\":[\"qux\",\"quix\"]}".data(using: .utf8)

let (data, response) = try await URLSession.shared.data(for: request)

```

## Wget (GET)

```Wget
wget \
  -O - \
  'https://example.com?baz=qux&baz=quix&foo=bar'
```

## Wget (POST)

```Wget
wget \
  --method='POST' \
  --body-data='{"name":"John Doe","baz":["qux","quix"]}' \
  --header='Content-Type: application/json' \
  -O - \
  'https://example.com'
```

