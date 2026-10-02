import { createServer, IncomingMessage, Server } from "node:http";
import { AddressInfo } from "node:net";
import { gzipSync } from "node:zlib";

export interface RecordedRequest {
    method: string;
    url: string;
    headers: [string, string][];
    body: string;
}

/**
 * A local echo server. It records every request and answers by path:
 * /redirect -> 302 to /final, /gzip -> gzip when accepted, /text -> text,
 * /empty -> empty body, anything else -> JSON.
 */
export class EchoServer {
    readonly requests: RecordedRequest[] = [];
    private server: Server;

    constructor() {
        this.server = createServer((req, res) => {
            const chunks: Buffer[] = [];
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", () => {
                this.requests.push({
                    method: req.method!,
                    url: req.url!,
                    headers: pairs(req),
                    body: Buffer.concat(chunks).toString("utf8"),
                });
                const path = req.url!.split("?")[0];
                if (path.endsWith("/redirect")) {
                    res.writeHead(302, { Location: "/final" }).end();
                } else if (path.endsWith("/gzip")) {
                    const text = "decoded gzip body";
                    if (/gzip/.test(String(req.headers["accept-encoding"] ?? ""))) {
                        res.writeHead(200, { "Content-Type": "text/plain", "Content-Encoding": "gzip" });
                        res.end(gzipSync(text));
                    } else {
                        res.writeHead(200, { "Content-Type": "text/plain" }).end(`plain: ${text}`);
                    }
                } else if (path.endsWith("/text")) {
                    res.writeHead(200, { "Content-Type": "text/plain" }).end("plain text response");
                } else if (path.endsWith("/empty")) {
                    res.writeHead(200).end();
                } else {
                    res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
                }
            });
        });
    }

    async start(): Promise<number> {
        await new Promise<void>((resolve) => this.server.listen(0, "0.0.0.0", resolve));
        return (this.server.address() as AddressInfo).port;
    }

    stop(): Promise<void> {
        return new Promise((resolve) => this.server.close(() => resolve()));
    }

    reset(): void {
        this.requests.length = 0;
    }
}

function pairs(req: IncomingMessage): [string, string][] {
    const result: [string, string][] = [];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
        // Node decodes header bytes as Latin-1; clients send UTF-8.
        result.push([
            req.rawHeaders[i],
            Buffer.from(req.rawHeaders[i + 1], "latin1").toString("utf8"),
        ]);
    }
    return result;
}
