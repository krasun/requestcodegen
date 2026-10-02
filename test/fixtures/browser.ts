// "Copy as cURL (bash)" output from browser developer tools.

export const chromeJsonPost = `curl 'https://api.example.com/graphql?op=Viewer' \\
  -H 'accept: application/json' \\
  -H 'accept-language: en-US,en;q=0.9,uk;q=0.8' \\
  -H 'content-type: application/json' \\
  -b 'logged_in=yes; _octo=GH1.1.1234; tz=Europe%2FKyiv' \\
  -H 'origin: https://example.com' \\
  -H 'priority: u=1, i' \\
  -H 'referer: https://example.com/' \\
  -H 'sec-ch-ua: "Chromium";v="129", "Not=A?Brand";v="8"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "macOS"' \\
  -H 'sec-fetch-dest: empty' \\
  -H 'sec-fetch-mode: cors' \\
  -H 'sec-fetch-site: same-site' \\
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36' \\
  --data-raw $'{"query":"query { viewer { login } }","variables":{"note":"it\\'s café — ok","path":"C:\\\\\\\\tmp"}}'`;

export const chromeGet = `curl 'https://www.example.com/search?q=caf%C3%A9&page=2' \\
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' \\
  -H 'accept-language: en-US,en;q=0.9' \\
  -H 'cache-control: no-cache' \\
  -b 'session=abc123' \\
  -H 'upgrade-insecure-requests: 1' \\
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'`;

export const firefoxFormPost = `curl 'https://example.com/api/subscribe' --compressed -X POST -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0' -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br, zstd' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Origin: https://example.com' -H 'Connection: keep-alive' -H 'Referer: https://example.com/' -H 'Cookie: session=abc; theme=dark' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-origin' -H 'Priority: u=0' --data-raw 'email=jane%40example.com&note=%C3%A9t%C3%A9'`;
