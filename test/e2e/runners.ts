import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { CodeTarget } from "../../src";

const ROOT = resolve(__dirname, "../..");
const CACHE = join(ROOT, "node_modules/.cache/e2e");
const PYTHON = join(CACHE, "venv/bin/python");
const PHP_DIR = join(CACHE, "php");

export interface Runner {
    target: CodeTarget;
    /** Skip requests the target rejects with UNSUPPORTED_TARGET instead of failing. */
    skipUnsupported?: boolean;
    /** false when the example does not print the response body. */
    printsResponse?: boolean;
    /** The host the code must use to reach the local server. */
    host: string;
    run(code: string): Promise<string>;
}

function scratch(name: string, content: string, dir = mkdtempSync(join(tmpdir(), "rcg-"))) {
    const file = join(dir, name);
    writeFileSync(file, content);
    return file;
}

const execFileAsync = promisify(execFile);

// Asynchronous, so the echo server in this process can keep answering.
async function exec(command: string, args: string[], cwd?: string): Promise<string> {
    const { stdout } = await execFileAsync(command, args, {
        cwd,
        encoding: "utf8",
        timeout: 60000,
    });
    return stdout;
}

const node = (target: CodeTarget, print: string, extension = "mjs"): Runner => ({
    target,
    host: "127.0.0.1",
    run: (code) =>
        // Run inside the repository so `import axios` resolves.
        exec("node", [
            scratch(
                `e2e-${Date.now()}-${Math.floor(Math.random() * 1e9)}.${extension}`,
                `${code}\n${print}\n`,
                CACHE
            ),
        ]),
});

function docker(
    target: CodeTarget,
    image: string,
    command: string,
    extension: string,
    print: string
): Runner {
    return {
        target,
        host: "host.docker.internal",
        run: (code) => {
            const name = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e9)}.${extension}`;
            scratch(name, `${code}\n${print}\n`, PHP_DIR);
            return exec("docker", [
                "run",
                "--rm",
                "--add-host=host.docker.internal:host-gateway",
                "-v",
                `${PHP_DIR}:/app`,
                "-w",
                "/app",
                image,
                command,
                name,
            ]);
        },
    };
}

const php = (target: CodeTarget, print: string) =>
    docker(target, "php:8.3-cli", "php", "php", print);

function compiled(target: CodeTarget, file: string, command: string[]): Runner {
    return {
        target,
        skipUnsupported: true,
        printsResponse: false,
        host: "127.0.0.1",
        run: (code) => {
            const path = scratch(file, code);
            return exec(command[0], [...command.slice(1), path]);
        },
    };
}

export const RUNNERS: Runner[] = [
    {
        target: CodeTarget.Curl,
        host: "127.0.0.1",
        run: (code) => exec("bash", [scratch("request.sh", `${code} -s\n`)]),
    },
    node(CodeTarget.NodeFetch, "console.log(await response.text());"),
    // Browser fetch output runs on Node's fetch, which follows the same API.
    node(CodeTarget.JavaScript, "console.log(await response.text());"),
    node(
        CodeTarget.NodeAxios,
        `console.log(typeof response.data === "string" ? response.data : JSON.stringify(response.data));`
    ),
    {
        target: CodeTarget.PythonRequests,
        host: "127.0.0.1",
        run: (code) => exec(PYTHON, [scratch("request.py", `${code}\nprint(response.text)\n`)]),
    },
    php(CodeTarget.PHPCurl, "echo $response;"),
    php(CodeTarget.PHPGuzzle, "echo $response->getBody();"),

];

export const OTHER_RUNNERS: Runner[] = [
    {
        target: CodeTarget.Python,
        skipUnsupported: true,
        printsResponse: false,
        host: "127.0.0.1",
        run: (code) => exec(PYTHON, [scratch("request.py", `${code}\ncall_api()\n`)]),
    },
    { ...node(CodeTarget.NodeHTTP, "", "cjs"), skipUnsupported: true, printsResponse: false },
    compiled(CodeTarget.Go, "main.go", ["go", "run"]),
    compiled(CodeTarget.Java, "Main.java", ["java"]),
    compiled(CodeTarget.Swift, "main.swift", ["swift"]),
    { ...docker(CodeTarget.Ruby, "ruby:3.3", "ruby", "rb", "send_request"), skipUnsupported: true, printsResponse: false },
    { ...php(CodeTarget.PHP, ""), skipUnsupported: true, printsResponse: false },
    { ...php(CodeTarget.PHPRequests, ""), skipUnsupported: true, printsResponse: false },
];
