// Verifies the packed npm artifact: CommonJS, ESM, TypeScript types and a
// browser bundle that runs without Node.js APIs.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const run = (command, args, cwd) =>
    execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

const dir = mkdtempSync(join(tmpdir(), "requestcodegen-package-"));
const tarball = run("npm", ["pack", "--silent", "--pack-destination", dir], root).trim().split("\n").pop();
writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", private: true }));
run("npm", ["install", "--silent", "--no-audit", "--no-fund", join(dir, tarball), "typescript@5", "esbuild"], dir);

const usage = `
const request = parse.curlCommand("curl 'https://example.com/items' -H 'Accept: application/json'");
const python = generateCode(request, CodeTarget.PythonRequests);
const fromJson = generateCode(JSON.parse(JSON.stringify(request)), CodeTarget.Curl);
const fromHttp = generateCode(parse.httpRequest("GET /items HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n", "https://example.com"), CodeTarget.Curl);
const post = generateCode({ url: "https://example.com", method: "POST", body: '{"a":1}' }, CodeTarget.Curl);
let code = "";
try { generateCode({ url: "nope" }, CodeTarget.Curl); } catch (e) { if (e instanceof GeneratorError) code = e.code; }
let parseCode = "";
try { parse.curlCommand("curl -F a=1 https://example.com"); } catch (e) { if (e instanceof ParseError) parseCode = e.code; }
if (!python.includes("requests.get") || fromJson !== "curl 'https://example.com/items' \\\\\\n  -H 'Accept: application/json'" || fromHttp !== "curl 'https://example.com/items'" || !post.includes('{"a":1}') || code !== "INVALID_REQUEST" || parseCode !== "UNSUPPORTED_INPUT") {
    throw new Error("Unexpected output: " + JSON.stringify({ python, fromJson, fromHttp, post, code, parseCode }));
}
console.log("ok");
`;
const names = "parse, generateCode, CodeTarget, GeneratorError, ParseError";

writeFileSync(join(dir, "cjs.cjs"), `const { ${names} } = require("requestcodegen");\n${usage}`);
writeFileSync(join(dir, "esm.mjs"), `import { ${names} } from "requestcodegen";\n${usage}`);
console.log("CommonJS:", run("node", ["cjs.cjs"], dir).trim());
console.log("ESM:", run("node", ["esm.mjs"], dir).trim());

writeFileSync(
    join(dir, "types.ts"),
    `import { ${names}, type RequestOptions, type GeneratorErrorCode, type ParseErrorCode } from "requestcodegen";
const request: RequestOptions = parse.curlCommand("curl https://example.com");
const target: CodeTarget = CodeTarget.PHPCurl;
const code: string = generateCode(request, target);
const errorCode: GeneratorErrorCode = new GeneratorError("INVALID_REQUEST", "x").code;
const parseErrorCode: ParseErrorCode = new ParseError("BASE_URL_REQUIRED", "x").code;
const fromHttp: RequestOptions = parse.httpRequest("GET / HTTP/1.1\\nHost: example.com\\n\\n");
export { code, errorCode, parseErrorCode, fromHttp };
`
);
for (const moduleResolution of ["node16", "bundler"]) {
    const module = moduleResolution === "node16" ? "node16" : "esnext";
    run("npx", ["tsc", "--noEmit", "--strict", "--module", module, "--moduleResolution", moduleResolution, "types.ts"], dir);
    console.log(`TypeScript (${moduleResolution}): ok`);
}

writeFileSync(join(dir, "browser.mjs"), `import { ${names} } from "requestcodegen";\n${usage}`);
run("npx", ["esbuild", "browser.mjs", "--bundle", "--platform=browser", "--format=iife", "--outfile=bundle.js"], dir);
const output = [];
vm.runInNewContext(readFileSync(join(dir, "bundle.js"), "utf8"), {
    console: { log: (line) => output.push(line) },
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    btoa,
});
console.log("Browser bundle without Node.js APIs:", output.join(""));
