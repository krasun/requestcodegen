import { invalidInput, unsupportedInput } from "../errors";

/** Marks an unescaped line break, which separates commands in Bash. */
export const COMMAND_BREAK = Symbol("command-break");

export type ShellToken = string | typeof COMMAND_BREAK;

const ANSI_C_SIMPLE: Record<string, string> = {
    a: "\x07",
    b: "\b",
    e: "\x1b",
    E: "\x1b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
    v: "\v",
    "\\": "\\",
    "'": "'",
    '"': '"',
    "?": "?",
};

const OPERATORS = new Set(["|", ";", "&", "<", ">", "(", ")"]);

/**
 * Splits Bash-style command text into words without executing anything.
 * Quoting, escapes, ANSI-C strings and line continuations are supported.
 * Variables like $TOKEN are kept as literal text; command substitution,
 * pipes, redirects and command chains are rejected.
 */
export function tokenizeBash(input: string): ShellToken[] {
    const text = input.replace(/\r\n?/g, "\n");
    const tokens: ShellToken[] = [];
    let word: string | null = null;
    // The word with quoted characters masked, to detect brace expansion.
    let unquoted = "";
    let i = 0;

    const append = (value: string, quoted: boolean) => {
        word = (word ?? "") + value;
        unquoted += quoted ? "x".repeat(value.length) : value;
    };
    const endWord = () => {
        if (word !== null) {
            if (/\{[^{}]*(,|\.\.)[^{}]*\}/.test(unquoted)) {
                unsupportedInput(
                    "Unquoted brace expansion is not supported. Quote the argument."
                );
            }
            tokens.push(word);
        }
        word = null;
        unquoted = "";
    };

    while (i < text.length) {
        const char = text[i];

        if (char === " " || char === "\t") {
            endWord();
            i++;
        } else if (char === "\n") {
            endWord();
            tokens.push(COMMAND_BREAK);
            i++;
        } else if (char === "\\") {
            if (text[i + 1] === "\n") {
                i += 2;
            } else if (i + 1 < text.length) {
                append(text[i + 1], true);
                i += 2;
            } else {
                i++;
            }
        } else if (char === "'") {
            const end = text.indexOf("'", i + 1);
            if (end === -1) {
                invalidInput("The command has an unterminated single quote.");
            }
            append(text.slice(i + 1, end), true);
            i = end + 1;
        } else if (char === '"') {
            i = readDoubleQuoted(text, i + 1, (value) => append(value, true));
        } else if (char === "$" && text[i + 1] === "'") {
            i = readAnsiC(text, i + 2, (value) => append(value, true));
        } else if (char === "$" && text[i + 1] === '"') {
            i = readDoubleQuoted(text, i + 2, (value) => append(value, true));
        } else if (char === "$" && text[i + 1] === "(") {
            unsupportedInput("Command substitution is not supported.");
        } else if (char === "`") {
            unsupportedInput("Command substitution is not supported.");
        } else if (OPERATORS.has(char)) {
            unsupportedInput(
                `The shell operator "${char}" is not supported. Only a single curl command is supported; quote URLs that contain "&".`
            );
        } else if (char === "#" && word === null) {
            while (i < text.length && text[i] !== "\n") {
                i++;
            }
        } else {
            append(char, false);
            i++;
        }
    }
    endWord();

    return tokens;
}

function readDoubleQuoted(
    text: string,
    start: number,
    append: (value: string) => void
): number {
    let i = start;
    let value = "";
    while (i < text.length) {
        const char = text[i];
        if (char === '"') {
            append(value);
            return i + 1;
        }
        if (char === "\\") {
            const next = text[i + 1];
            if (next === "\n") {
                i += 2;
                continue;
            }
            if (next === "$" || next === "`" || next === '"' || next === "\\") {
                value += next;
                i += 2;
                continue;
            }
            value += char;
            i++;
            continue;
        }
        if (char === "`" || (char === "$" && text[i + 1] === "(")) {
            unsupportedInput("Command substitution is not supported.");
        }
        value += char;
        i++;
    }
    return invalidInput("The command has an unterminated double quote.");
}

function readAnsiC(
    text: string,
    start: number,
    append: (value: string) => void
): number {
    let i = start;
    let value = "";
    let bytes: number[] = [];

    const flushBytes = () => {
        if (bytes.length === 0) {
            return;
        }
        try {
            value += new TextDecoder("utf-8", { fatal: true }).decode(
                new Uint8Array(bytes)
            );
        } catch {
            unsupportedInput("Binary data in $'...' strings is not supported.");
        }
        bytes = [];
    };

    while (i < text.length) {
        const char = text[i];
        if (char === "'") {
            flushBytes();
            append(value);
            return i + 1;
        }
        if (char !== "\\") {
            flushBytes();
            value += char;
            i++;
            continue;
        }

        const next = text[i + 1];
        let match: RegExpMatchArray | null;
        const rest = text.slice(i + 1);
        if ((match = rest.match(/^x([0-9a-fA-F]{1,2})/))) {
            bytes.push(parseInt(match[1], 16));
            i += 1 + match[0].length;
        } else if ((match = rest.match(/^[0-7]{1,3}/))) {
            bytes.push(parseInt(match[0], 8) & 0xff);
            i += 1 + match[0].length;
        } else if ((match = rest.match(/^(u[0-9a-fA-F]{1,4}|U[0-9a-fA-F]{1,8})/))) {
            flushBytes();
            const code = parseInt(match[0].slice(1), 16);
            if (code > 0x10ffff) {
                invalidInput("The command has an invalid Unicode escape.");
            }
            value += String.fromCodePoint(code);
            i += 1 + match[0].length;
        } else if (next === "c" && i + 2 < text.length) {
            flushBytes();
            value += String.fromCharCode(text.charCodeAt(i + 2) & 0x1f);
            i += 3;
        } else if (next !== undefined && next in ANSI_C_SIMPLE) {
            flushBytes();
            value += ANSI_C_SIMPLE[next];
            i += 2;
        } else {
            flushBytes();
            value += "\\" + (next ?? "");
            i += 2;
        }
    }
    return invalidInput("The command has an unterminated $'...' string.");
}
