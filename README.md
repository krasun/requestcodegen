# requestcodegen

[![Build](https://github.com/krasun/requestcodegen/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/krasun/requestcodegen/actions/workflows/build.yml)
[![NPM package](https://img.shields.io/npm/v/requestcodegen.svg?branch=main)](https://www.npmjs.com/package/requestcodegen)

`requestcodegen` parses curl commands and raw HTTP requests, and generates HTTP client code in different programming languages.

It is synchronous, has no runtime dependencies and works offline in browsers and Node.js 18+. It never executes commands, reads files or makes network requests.

## Install

```shell
npm install requestcodegen
```

## Use

```typescript
import {
    parse,
    generateCode,
    CodeTarget,
    ParseError,
    GeneratorError,
} from "requestcodegen";

// curl -> request -> code
const request = parse.curlCommand(
    "curl 'https://example.com/items' -H 'Accept: application/json'"
);
const python = generateCode(request, CodeTarget.PythonRequests);

// Requests are plain JSON
const requestJson = JSON.stringify(request, null, 2);
const curl = generateCode(JSON.parse(requestJson), CodeTarget.Curl);

// Raw HTTP -> curl
const curlFromHttp = generateCode(
    parse.httpRequest("GET /items HTTP/1.1\r\nHost: example.com\r\n\r\n"),
    CodeTarget.Curl
);

// Errors tell you which step failed and have a stable code
try {
    const code = generateCode(parse.curlCommand(input), CodeTarget.JavaScript);
} catch (error) {
    if (error instanceof ParseError) {
        console.log(error.code, error.message); // e.g. UNSUPPORTED_INPUT for -F
    } else if (error instanceof GeneratorError) {
        console.log(error.code, error.message); // e.g. UNSUPPORTED_TARGET
    }
}
```

## API

```typescript
parse.curlCommand(command: string): RequestOptions;
parse.httpRequest(input: string, baseUrl?: string): RequestOptions;
generateCode(request: RequestOptions, target: CodeTarget): string;
```

`generateCode` validates the request and never mutates it.

### Request format

The request is a plain object, and JSON documents with this shape are accepted as is:

```typescript
interface RequestOptions {
    url: string; // absolute http:// or https:// URL
    method?: string; // defaults to GET
    query?: Record<string, string | string[]>;
    headers?: Record<string, string>;
    body?: string;
    followRedirects?: boolean;
    compressed?: boolean;
}
```

```json
{
    "url": "https://example.com/items?sort=asc",
    "method": "POST",
    "query": { "tag": ["a", "b"] },
    "headers": { "Content-Type": "application/json" },
    "body": "{\"name\":\"John\"}",
    "followRedirects": true
}
```

- **url**: the existing query is kept exactly as written, including duplicate keys. The fragment is dropped, because it is never sent. Spaces and non-ASCII characters are percent-encoded.
- **query**: appended to the URL once, encoded as `application/x-www-form-urlencoded` (the same as `URLSearchParams`). Arrays become repeated keys (`tag=a&tag=b`), and empty arrays add nothing.
- **headers**: names are compared case-insensitively. Case variants of the same name, non-string values and line breaks or other control characters are rejected. Authentication and cookies are plain `Authorization` and `Cookie` headers.
- **body**: UTF-8 text sent exactly as is. Generators never parse or re-serialize it. `""` is an empty body and `undefined` is no body.
- **followRedirects**, **compressed**: omitted means the client's default behavior. See [targets](#targets).

### Errors

The parsers throw `ParseError` and `generateCode` throws `GeneratorError`. Both have a `code` and, when relevant, a `field`. Messages name the option or field, but never include header values, credentials or bodies.

| Class | Code | Meaning |
| - | - | - |
| `ParseError` | `INVALID_INPUT` | Malformed input: bad URL, header, method, quoting or request line. |
| `ParseError` | `UNSUPPORTED_INPUT` | Valid input this release does not support, for example `-F`, files, pipes or chunked bodies. |
| `ParseError` | `BASE_URL_REQUIRED` | A raw HTTP request with a path target and no `Host` header needs `baseUrl`. |
| `GeneratorError` | `INVALID_REQUEST` | The request object is invalid: bad URL, method, header, query or body. |
| `GeneratorError` | `UNSUPPORTED_TARGET` | Unknown target, or a request the target's client cannot send as specified. |

## curl parsing

`parse.curlCommand` accepts one Bash-style command starting with `curl` or `curl.exe`. It supports what browser developer tools produce with "Copy as cURL (bash)", including:

- single and double quotes, escapes, `$'...'` strings (with `\xHH` UTF-8 bytes) and `\` line continuations;
- options before or after the URL, `--`, combined short options (`-sSL`), attached values (`-XPOST`) and `--option=value`;
- a leading `$ ` prompt.

Shell variables such as `$API_TOKEN` stay literal text. Command substitution, pipes, redirects, `;`, `&&`, `&`, brace expansion and multiple commands are rejected with `UNSUPPORTED_INPUT`. A URL without a scheme gets `http://`, like curl.

| Options | Result |
| - | - |
| `-X`, `--request` | Method. |
| `-I`, `--head` | `HEAD`. |
| `--url`, positional URL | URL. Only one URL is supported. |
| `-H`, `--header` | Header. `Name;` sends an empty header. Repeated names are combined with `, ` (`; ` for `Cookie`). `Name:` (removing a curl default) is rejected. |
| `-d`, `--data`, `--data-ascii`, `--data-binary`, `--data-raw` | Body, joined with `&`. A leading `@` is a file except with `--data-raw`. |
| `--data-urlencode` | Encoded like curl: `content`, `=content`, `name=content`. |
| `--json` | Body plus `Content-Type` and `Accept: application/json` defaults. The JSON is not validated or reformatted. |
| `-G`, `--get` | Data is appended to the query instead. |
| `-u`, `--user`, `--basic`, credentials in the URL | `Authorization: Basic ...`. A missing password (a prompt) is rejected. |
| `--oauth2-bearer` | `Authorization: Bearer ...`. |
| `-b`, `--cookie` | `Cookie` header (`name=value` only; a file name is rejected). |
| `-A`, `--user-agent`, `-e`, `--referer` | `User-Agent`, `Referer`. |
| `-L`, `--location`, `--no-location` | `followRedirects: true` / `false`. |
| `--compressed`, `--no-compressed` | `compressed: true` / omitted. |
| `-g`, `--globoff` | URL globbing off. Without it, `{a,b}` and `[1-9]` patterns are rejected; other brackets are kept literally. |
| `-s`, `-S`, `-v`, `-i`, `-o`, `-O`, `-w`, `-#`, `-f`, `--fail-with-body`, `-m`, `--connect-timeout`, `--retry`, `--http1.1`, `--http2`, `-N`, `--no-progress-meter` | Output and transfer options. Accepted and omitted from generated code. |

Curl's precedence rules apply: the method comes from `-X`, then `-I`, then data (`POST`), else `GET`. Explicit `-H` headers win over `-u`, `-A`, `-e`, `-b` and the `--json` and `-d` content type defaults. Data sets `Content-Type: application/x-www-form-urlencoded` unless a content type is given.

Everything else is rejected: unknown options, `-F`/`--form`, `-T`, `-K`, `-k`, `--next`, other auth methods, file and stdin references, non-HTTP URLs and multiple URLs.

## Raw HTTP parsing

`parse.httpRequest` accepts HTTP/1.0 and HTTP/1.1 request text with LF or CRLF line endings, as copied from browser developer tools.

- The request target can be an absolute URL or a path. A path is resolved against `baseUrl` (only its origin is used) or, without `baseUrl`, against `https://` plus the `Host` header. If neither is available, it throws `BASE_URL_REQUIRED`. A target starting with `//` never changes the host.
- `Host` must match the URL. `Host` and `Content-Length` are removed from the headers because clients compute them.
- The body starts after the first blank line and is kept byte for byte, including trailing newlines. A request with no body text and `Content-Length: 0` gets an empty-string body.
- Repeated headers are combined like in curl parsing.
- Chunked `Transfer-Encoding`, folded header lines, HTTP/2 pseudo-headers, `CONNECT`, `OPTIONS *` and binary data are rejected.

## Targets

These targets are verified end to end against a local server, including redirects, compressed, JSON, text and empty responses:

| Target | Output | Requirements |
| - | - | - |
| `Curl` | Bash curl command | curl |
| `PythonRequests` | Python | `pip install requests` |
| `JavaScript` | Browser `fetch()`, ES module with top-level `await` | A modern browser |
| `NodeFetch` | Native Node.js `fetch()`, ES module (`.mjs`) with top-level `await` | Node.js 18+ |
| `NodeAxios` | Axios, ES module (`.mjs`) with top-level `await` | `npm install axios` (1.x) |
| `PHPCurl` | PHP cURL extension | PHP with `ext-curl` |
| `PHPGuzzle` | Guzzle | `composer require guzzlehttp/guzzle` (7.x) |

Examples assign the response to `response` (`$response` in PHP) and do not assume it is JSON.

| Target | `followRedirects` | `compressed` |
| - | - | - |
| `Curl` | `true` adds `-L` | `true` adds `--compressed` |
| `PythonRequests` | `allow_redirects` when it differs from the default (Requests follows, except for `HEAD`) | Requests asks for compression by default; `false` sends `Accept-Encoding: identity` |
| `JavaScript` | `false` sets `redirect: "manual"` (browsers return an opaque response that cannot be inspected) | Browsers always negotiate compression; `false` is rejected |
| `NodeFetch` | `false` sets `redirect: "manual"` | Enabled by default; `false` sends `Accept-Encoding: identity` |
| `NodeAxios` | `false` sets `maxRedirects: 0` (Axios then rejects 3xx responses) | Enabled by default; `false` sends `Accept-Encoding: identity` |
| `PHPCurl` | `true` sets `CURLOPT_FOLLOWLOCATION` | `true` sets `CURLOPT_ENCODING => ''` |
| `PHPGuzzle` | `false` sets `allow_redirects => false` | `true` sets `decode_content` |

An explicit `Accept-Encoding` header is always sent as given.

Target limitations:

- **JavaScript** (browser): headers a browser controls itself are left out: `Cookie`, `Origin`, `Referer`, `Host`, `Connection`, `Accept-Encoding`, `Content-Length`, `Sec-*`, `Proxy-*` and the other [forbidden request headers](https://fetch.spec.whatwg.org/#forbidden-request-header). A `Cookie` header becomes `credentials: "include"`, so the browser sends its own cookies.
- **JavaScript**, **NodeFetch**: a body with `GET` or `HEAD`, credentials in the URL, and a `Host` header for a different host are rejected. **NodeFetch** also rejects `Keep-Alive`, `Transfer-Encoding`, `Upgrade` and `Expect` headers, which Node.js refuses.
- **JavaScript**, **NodeFetch**, **NodeAxios**: header values must be ASCII, because these clients cannot send UTF-8 header values. Python sends them as UTF-8 bytes, and curl and PHP send them as is.
- **PythonRequests**: methods are sent in upper case. Bodies are sent unchanged with `data=`.
- **JavaScript**, **NodeFetch**, **NodeAxios**: a JSON body is shown as an object literal only when `JSON.stringify` reproduces the exact same text. Otherwise it stays a string, and Axios gets `transformRequest` so the text is not re-serialized.
- **Curl**, **PHPCurl**: like curl itself, a body without `Content-Type` is sent as `application/x-www-form-urlencoded`.

### Other targets

`Clojure`, `CSharp`, `Dart`, `Elixir`, `Go`, `Java`, `Kotlin`, `NodeHTTP`, `ObjectiveC`, `PHP` (stream contexts), `PHPRequests`, `Python` (urllib), `Ruby`, `Rust`, `Swift` and `Wget` use the same validation, query handling and escaping. Go, Java, Swift, Ruby, Python (urllib), Node HTTP, PHP and PHP Requests are also run end to end in this repository's tests.

They generate each client's default redirect and compression behavior and throw `UNSUPPORTED_TARGET` for an explicit `followRedirects` or `compressed` value that differs from it:

| Follows redirects by default | Does not |
| - | - |
| Clojure, C#, Dart, Go, Java, Kotlin, Objective-C, PHP, PHP Requests, Python, Rust, Swift, Wget | Elixir, Node HTTP, Ruby |

| Requests compression by default | Does not |
| - | - |
| Clojure, Dart, Go, Objective-C, PHP Requests, Ruby, Swift | C#, Elixir, Java, Kotlin, Node HTTP, PHP, Python, Rust, Wget |

Other limitations:

- Java and Kotlin (`HttpURLConnection`) reject methods other than GET, POST, HEAD, OPTIONS, PUT, DELETE and TRACE. For headers it normally drops (`Origin`, `Connection`, `Host`, ...), the code sets `sun.net.http.allowRestrictedHeaders`.
- Python (urllib), Node HTTP and Swift reject non-ASCII header values.
- PHP Requests rejects empty header values, which it would not send.
- C# rejects `Content-*` headers without a body.

## Compatibility

`generateCode`, `RequestOptions` and every existing `CodeTarget` name and value are unchanged, `CodeTarget.PHP` is still the stream implementation, and calls like `generateCode({ url }, CodeTarget.Curl)` still work. `JsonBody` was removed: pass `JSON.stringify(value)` as the body and set `Content-Type: application/json`.

Generated code changed on purpose to fix incorrect output. See [CHANGELOG.md](CHANGELOG.md).

## Development

```shell
npm install
npm test             # unit tests
npm run typecheck
npm run build        # dist/: ESM, CommonJS and type declarations
npm run test:package # packs the library and imports it from ESM, CommonJS, TypeScript and a browser bundle
npm run examples     # regenerates examples.md
```

`npm run test:e2e` runs generated code against a local server. It needs curl, Node.js, Docker (PHP, Composer and Ruby images), Go, Java and Swift, plus a Python virtual environment and PHP dependencies in `node_modules/.cache/e2e`:

```shell
python3 -m venv node_modules/.cache/e2e/venv
node_modules/.cache/e2e/venv/bin/pip install requests
mkdir -p node_modules/.cache/e2e/php
docker run --rm -v "$PWD/node_modules/.cache/e2e/php":/app -w /app composer:2 require guzzlehttp/guzzle:^7 rmccue/requests:^2
```

To publish, bump the version in `package.json`, update the changelog and run `npm publish`. `prepublishOnly` type-checks, tests, builds and verifies the packed package.

## Code examples

Check out examples of generated code in the [examples.md](examples.md) file.

## Known usages

1. [ScreenshotOne](https://screenshotone.com) uses the library for generating code examples in the playground for the screenshot API.

If you use the library, please, don't hesitate to share how and in what project.

## License

`krasun/requestcodegen` is released under [the MIT license](LICENSE).
