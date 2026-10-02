/**
 * String literal helpers. Every generator must emit request data through
 * these so quotes, backslashes, line breaks, interpolation markers and shell
 * metacharacters always stay data.
 */

/** A single-quoted Bash word. Nothing inside single quotes is special. */
export function shellQuote(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** A double-quoted JavaScript string (valid since ES2019, JSON superset). */
export function jsString(value: string): string {
    return JSON.stringify(value);
}

function hex(code: number, width: number): string {
    return code.toString(16).toUpperCase().padStart(width, "0");
}

type ControlStyle = "u4" | "ubrace" | "octal" | "x";

interface QuoteStyle {
    quote: '"' | "'";
    /** Escape "$" (Kotlin, Dart, PHP double quotes). */
    dollar?: boolean;
    /** Escape "#" (Ruby, Elixir interpolation). */
    hash?: boolean;
    control: ControlStyle;
}

function escapeControl(code: number, style: ControlStyle): string {
    switch (style) {
        case "u4":
            return `\\u${hex(code, 4)}`;
        case "ubrace":
            return `\\u{${hex(code, 1)}}`;
        case "octal":
            return `\\${code.toString(8).padStart(3, "0")}`;
        case "x":
            return `\\x${hex(code, 2)}`;
    }
}

function quoteWith(value: string, style: QuoteStyle): string {
    let result = style.quote;
    for (const char of value) {
        const code = char.codePointAt(0)!;
        if (char === "\\") {
            result += "\\\\";
        } else if (char === style.quote) {
            result += `\\${char}`;
        } else if (char === "\n") {
            result += "\\n";
        } else if (char === "\r") {
            result += "\\r";
        } else if (char === "\t") {
            result += "\\t";
        } else if (style.dollar && char === "$") {
            result += "\\$";
        } else if (style.hash && char === "#") {
            result += "\\#";
        } else if (code < 0x20 || code === 0x7f) {
            result += escapeControl(code, style.control);
        } else {
            result += char;
        }
    }
    return result + style.quote;
}

/** Like Python's repr(): single quotes when that avoids escaping double quotes. */
export function pythonString(value: string): string {
    const quote = value.includes('"') && !value.includes("'") ? "'" : '"';
    return quoteWith(value, { quote, control: "x" });
}

/** A single-quoted PHP string, or a double-quoted one when it holds control characters. */
export function phpString(value: string): string {
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) {
        return quoteWith(value, { quote: '"', dollar: true, control: "x" });
    }
    return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

export const goString = (v: string) => quoteWith(v, { quote: '"', control: "u4" });
export const javaString = (v: string) =>
    quoteWith(v, { quote: '"', control: "octal" });
export const csharpString = (v: string) =>
    quoteWith(v, { quote: '"', control: "u4" });
export const kotlinString = (v: string) =>
    quoteWith(v, { quote: '"', dollar: true, control: "u4" });
export const dartString = (v: string) =>
    quoteWith(v, { quote: "'", dollar: true, control: "u4" });
export const swiftString = (v: string) =>
    quoteWith(v, { quote: '"', control: "ubrace" });
export const rustString = (v: string) =>
    quoteWith(v, { quote: '"', control: "ubrace" });
export const rubyString = (v: string) =>
    quoteWith(v, { quote: '"', hash: true, control: "u4" });
export const elixirString = (v: string) =>
    quoteWith(v, { quote: '"', hash: true, control: "u4" });
export const clojureString = (v: string) =>
    quoteWith(v, { quote: '"', control: "u4" });
export const objcString = (v: string) =>
    `@${quoteWith(v, { quote: '"', control: "octal" })}`;

export function indent(text: string, spaces: number): string {
    const pad = " ".repeat(spaces);
    return text
        .split("\n")
        .map((line, index) => (index === 0 || line === "" ? line : pad + line))
        .join("\n");
}
