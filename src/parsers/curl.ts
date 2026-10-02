import { invalidInput, unsupportedInput } from "../errors";
import { appendQuery, isToken, toRequest, prepareUrl } from "../request";
import { RequestOptions } from "../request";
import { COMMAND_BREAK, ShellToken, tokenizeBash } from "./shell";

type DataKind = "data" | "raw" | "urlencode" | "json";

interface CurlState {
    method?: string;
    head: boolean;
    get: boolean;
    urls: string[];
    headers: [string, string][];
    data: { kind: DataKind; value: string }[];
    user?: string;
    bearer?: string;
    cookies: string[];
    userAgent?: string;
    referer?: string;
    location?: boolean;
    compressed: boolean;
    globoff: boolean;
}

interface OptionSpec {
    long: string;
    short?: string;
    arg?: boolean;
    /** Whether --no-<name> is accepted. */
    negatable?: boolean;
    apply: (state: CurlState, value: string, enabled: boolean) => void;
}

const ignore = () => {};

const rejectFile = (option: string, what: string) =>
    unsupportedInput(
        `${option} with ${what} reads a file or stdin, which is not supported. Paste the content inline instead.`,
        option
    );

function addData(kind: DataKind, option: string) {
    return (state: CurlState, value: string) => {
        if (kind !== "raw" && kind !== "urlencode" && value.startsWith("@")) {
            rejectFile(option, "@");
        }
        state.data.push({ kind, value });
    };
}

const OPTIONS: OptionSpec[] = [
    { long: "request", short: "X", arg: true, apply: (s, v) => (s.method = v) },
    { long: "head", short: "I", negatable: true, apply: (s, _, on) => (s.head = on) },
    { long: "get", short: "G", negatable: true, apply: (s, _, on) => (s.get = on) },
    { long: "url", arg: true, apply: (s, v) => s.urls.push(v) },
    {
        long: "header",
        short: "H",
        arg: true,
        apply: (s, v) => s.headers.push(parseHeaderArgument(v)),
    },
    { long: "data", short: "d", arg: true, apply: addData("data", "--data") },
    { long: "data-ascii", arg: true, apply: addData("data", "--data-ascii") },
    { long: "data-binary", arg: true, apply: addData("data", "--data-binary") },
    { long: "data-raw", arg: true, apply: addData("raw", "--data-raw") },
    {
        long: "data-urlencode",
        arg: true,
        apply: (s, v) => s.data.push({ kind: "urlencode", value: curlUrlencode(v) }),
    },
    { long: "json", arg: true, apply: addData("json", "--json") },
    { long: "user", short: "u", arg: true, apply: (s, v) => (s.user = v) },
    { long: "basic", negatable: true, apply: ignore },
    { long: "oauth2-bearer", arg: true, apply: (s, v) => (s.bearer = v) },
    {
        long: "cookie",
        short: "b",
        arg: true,
        apply: (s, v) => {
            if (!v.includes("=")) {
                rejectFile("--cookie", "a file name");
            }
            s.cookies.push(v);
        },
    },
    { long: "user-agent", short: "A", arg: true, apply: (s, v) => (s.userAgent = v) },
    { long: "referer", short: "e", arg: true, apply: (s, v) => (s.referer = v) },
    {
        long: "location",
        short: "L",
        negatable: true,
        apply: (s, _, on) => (s.location = on),
    },
    {
        long: "compressed",
        negatable: true,
        apply: (s, _, on) => (s.compressed = on),
    },
    { long: "globoff", short: "g", negatable: true, apply: (s, _, on) => (s.globoff = on) },

    // Output-only and transfer-tuning options. They do not change the request
    // and are omitted from generated code.
    { long: "silent", short: "s", negatable: true, apply: ignore },
    { long: "show-error", short: "S", negatable: true, apply: ignore },
    { long: "verbose", short: "v", negatable: true, apply: ignore },
    { long: "include", short: "i", negatable: true, apply: ignore },
    { long: "output", short: "o", arg: true, apply: ignore },
    { long: "remote-name", short: "O", negatable: true, apply: ignore },
    { long: "write-out", short: "w", arg: true, apply: ignore },
    { long: "progress-bar", short: "#", negatable: true, apply: ignore },
    { long: "no-progress-meter", apply: ignore },
    { long: "fail", short: "f", negatable: true, apply: ignore },
    { long: "fail-with-body", negatable: true, apply: ignore },
    { long: "max-time", short: "m", arg: true, apply: ignore },
    { long: "connect-timeout", arg: true, apply: ignore },
    { long: "retry", arg: true, apply: ignore },
    { long: "http1.1", apply: ignore },
    { long: "http2", apply: ignore },
    { long: "buffer", negatable: true, apply: ignore },
    { long: "no-buffer", short: "N", apply: ignore },
];

const EXPLAINED: Record<string, string> = {
    form: "Multipart form uploads (-F, --form) are not supported yet.",
    "form-string": "Multipart form uploads (--form-string) are not supported yet.",
    "upload-file": "File uploads (-T, --upload-file) are not supported.",
    config: "Config files (-K, --config) are not supported.",
    next: "Multiple requests (--next) are not supported.",
    insecure:
        "Disabling TLS verification (-k, --insecure) is not supported in generated code.",
};

const SHORT_EXPLAINED: Record<string, string> = {
    F: "form",
    T: "upload-file",
    K: "config",
    ":": "next",
    k: "insecure",
};

const BY_LONG = new Map(OPTIONS.map((option) => [option.long, option]));
const BY_SHORT = new Map(
    OPTIONS.filter((option) => option.short).map((option) => [option.short!, option])
);

function unknownOption(name: string): never {
    const long = name.replace(/^--?/, "");
    const explained = EXPLAINED[long] ?? EXPLAINED[SHORT_EXPLAINED[long] ?? ""];
    if (explained) {
        unsupportedInput(explained, name);
    }
    return unsupportedInput(`The curl option ${name} is not supported.`, name);
}

function parseHeaderArgument(value: string): [string, string] {
    if (value.startsWith("@")) {
        rejectFile("--header", "@");
    }
    const colon = value.indexOf(":");
    const semicolon = value.indexOf(";");
    if (colon > 0) {
        const name = value.slice(0, colon).trim();
        const headerValue = value.slice(colon + 1).trim();
        if (headerValue === "") {
            unsupportedInput(
                `-H "${name}:" removes a header curl sends by default, which is not supported. Use "${name};" for an empty header.`,
                "--header"
            );
        }
        return [name, headerValue];
    }
    if (semicolon > 0 && value.slice(semicolon + 1).trim() === "") {
        return [value.slice(0, semicolon).trim(), ""];
    }
    return invalidInput(
        "A -H value must look like \"Name: value\".",
        "--header"
    );
}

/** Mirrors curl's --data-urlencode: [name]=content, name@file, @file or content. */
function curlUrlencode(value: string): string {
    const separator = value.search(/[=@]/);
    if (separator !== -1 && value[separator] === "@") {
        rejectFile("--data-urlencode", "@");
    }
    const encode = (content: string) =>
        encodeURIComponent(content)
            .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
            .replace(/%20/g, "+");
    if (separator === -1) {
        return encode(value);
    }
    const name = value.slice(0, separator);
    const content = encode(value.slice(separator + 1));
    return name ? `${name}=${content}` : content;
}

function joinData(parts: CurlState["data"]): string {
    let result = "";
    parts.forEach((part, index) => {
        // curl appends --json content without a separator.
        if (index > 0 && part.kind !== "json") {
            result += "&";
        }
        result += part.value;
    });
    return result;
}

function base64(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary);
}

function readArguments(tokens: string[]): CurlState {
    const state: CurlState = {
        head: false,
        get: false,
        urls: [],
        headers: [],
        data: [],
        cookies: [],
        compressed: false,
        globoff: false,
    };

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const nextValue = (option: string): string => {
            if (i + 1 >= tokens.length) {
                invalidInput(`The option ${option} requires a value.`, option);
            }
            return tokens[++i];
        };

        if (token === "--") {
            state.urls.push(...tokens.slice(i + 1));
            break;
        }

        if (token.startsWith("--")) {
            const equals = token.indexOf("=");
            const name = equals === -1 ? token.slice(2) : token.slice(2, equals);
            let spec = BY_LONG.get(name);
            let enabled = true;
            if (!spec && name.startsWith("no-")) {
                const positive = BY_LONG.get(name.slice(3));
                if (positive?.negatable) {
                    spec = positive;
                    enabled = false;
                }
            }
            if (!spec) {
                unknownOption(`--${name}`);
            }
            if (spec.arg) {
                const value =
                    equals === -1 ? nextValue(`--${name}`) : token.slice(equals + 1);
                spec.apply(state, value, true);
            } else {
                if (equals !== -1) {
                    invalidInput(`The option --${name} does not take a value.`, `--${name}`);
                }
                spec.apply(state, "", enabled);
            }
            continue;
        }

        if (token.startsWith("-") && token.length > 1) {
            for (let j = 1; j < token.length; j++) {
                const short = token[j];
                const spec = BY_SHORT.get(short);
                if (!spec) {
                    unknownOption(`-${short}`);
                }
                if (spec.arg) {
                    const attached = token.slice(j + 1);
                    spec.apply(state, attached || nextValue(`-${short}`), true);
                    break;
                }
                spec.apply(state, "", true);
            }
            continue;
        }

        state.urls.push(token);
    }

    return state;
}

function resolveUrl(raw: string, globoff: boolean): string {
    let url = raw;
    const scheme = url.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
    if (!scheme) {
        url = `http://${url}`;
    } else if (!/^https?$/i.test(scheme[1])) {
        unsupportedInput("Only http:// and https:// URLs are supported.", "url");
    }
    if (
        !globoff &&
        (/\{[^{}]*,[^{}]*\}/.test(url) ||
            /\[\s*(\d+-\d+|[a-zA-Z]-[a-zA-Z])(:\d+)?\s*\]/.test(url))
    ) {
        unsupportedInput(
            "URL globbing ({a,b} or [1-9]) is not supported. Add -g to use the characters literally.",
            "url"
        );
    }
    return url;
}

/**
 * Parses a single Bash-style curl command into a request. Nothing is
 * executed and no file is read.
 */
export function parseCurlCommand(command: string): RequestOptions {
    if (typeof command !== "string") {
        invalidInput("The curl command must be a string.");
    }

    const commands: string[][] = [[]];
    for (const token of tokenizeBash(command) as ShellToken[]) {
        if (token === COMMAND_BREAK) {
            if (commands[commands.length - 1].length > 0) {
                commands.push([]);
            }
        } else {
            commands[commands.length - 1].push(token);
        }
    }
    const nonEmpty = commands.filter((tokens) => tokens.length > 0);
    if (nonEmpty.length === 0) {
        invalidInput("The curl command is empty.");
    }
    if (nonEmpty.length > 1) {
        unsupportedInput("Only a single curl command is supported.");
    }

    const tokens = nonEmpty[0];
    if (tokens[0] === "$") {
        tokens.shift();
    }
    const program = (tokens[0] ?? "").split(/[\\/]/).pop()!.toLowerCase();
    if (program !== "curl" && program !== "curl.exe") {
        invalidInput("The command must start with curl.");
    }

    const state = readArguments(tokens.slice(1));

    if (state.urls.length === 0) {
        invalidInput("The curl command has no URL.", "url");
    }
    if (state.urls.length > 1) {
        unsupportedInput("Only one URL per command is supported.", "url");
    }
    if (state.head && state.data.length > 0 && !state.get) {
        invalidInput("-I (HEAD) cannot be combined with request data.", "--head");
    }
    const hasJson = state.data.some((part) => part.kind === "json");
    if (state.get && hasJson) {
        unsupportedInput("--json cannot be combined with -G.", "--json");
    }
    if (state.method !== undefined && !isToken(state.method)) {
        invalidInput("The -X value is not a valid HTTP method.", "--request");
    }

    let url = resolveUrl(state.urls[0], state.globoff);
    let urlCredentials: string | undefined;
    const parsed = new URL(prepareUrl(url));
    if (parsed.username || parsed.password) {
        urlCredentials = `${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}`;
        url = url.replace(/^(https?:\/\/)[^/?#]*@/i, "$1");
    }

    let body: string | undefined;
    if (state.data.length > 0) {
        const data = joinData(state.data);
        if (state.get) {
            url = appendQuery(url.split("#")[0], data);
        } else {
            body = data;
        }
    }

    let method: string;
    if (state.method !== undefined) {
        method = state.method;
    } else if (state.head) {
        method = "HEAD";
    } else if (body !== undefined) {
        method = "POST";
    } else {
        method = "GET";
    }

    const headers = buildHeaders(state, body !== undefined, hasJson, urlCredentials);

    const request: RequestOptions = { url: prepareUrl(url), method };
    if (headers.length > 0) {
        request.headers = Object.fromEntries(headers);
    }
    if (body !== undefined) {
        request.body = body;
    }
    if (state.location !== undefined) {
        request.followRedirects = state.location;
    }
    if (state.compressed) {
        request.compressed = true;
    }

    toRequest(request);

    return request;
}

function buildHeaders(
    state: CurlState,
    hasBody: boolean,
    hasJson: boolean,
    urlCredentials: string | undefined
): [string, string][] {
    const custom: [string, string][] = [];
    for (const [name, value] of state.headers) {
        const existing = custom.find(
            ([key]) => key.toLowerCase() === name.toLowerCase()
        );
        if (existing) {
            existing[1] += (name.toLowerCase() === "cookie" ? "; " : ", ") + value;
        } else {
            custom.push([name, value]);
        }
    }
    const hasCustom = (name: string) =>
        custom.some(([key]) => key.toLowerCase() === name.toLowerCase());

    const defaults: [string, string][] = [];
    const credentials = state.user ?? urlCredentials;
    if (state.bearer !== undefined) {
        defaults.push(["Authorization", `Bearer ${state.bearer}`]);
    } else if (credentials !== undefined) {
        if (!credentials.includes(":")) {
            unsupportedInput(
                "-u without a password makes curl prompt for it, which is not supported. Use -u user:password.",
                "--user"
            );
        }
        defaults.push(["Authorization", `Basic ${base64(credentials)}`]);
    }
    if (state.userAgent !== undefined) {
        defaults.push(["User-Agent", state.userAgent]);
    }
    if (state.referer !== undefined) {
        const referer = state.referer.replace(/;auto$/, "");
        if (referer) {
            defaults.push(["Referer", referer]);
        }
    }
    if (state.cookies.length > 0) {
        defaults.push(["Cookie", state.cookies.join("; ")]);
    }
    if (hasBody) {
        defaults.push([
            "Content-Type",
            hasJson ? "application/json" : "application/x-www-form-urlencoded",
        ]);
    }
    if (hasJson) {
        defaults.push(["Accept", "application/json"]);
    }

    return [...defaults.filter(([name]) => !hasCustom(name)), ...custom];
}
