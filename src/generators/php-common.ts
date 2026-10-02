import { phpString } from "../escape";
import { LiteralSyntax } from "./common";

export const PHP: LiteralSyntax = {
    string: phpString,
    key: phpString,
    null: "null",
    true: "true",
    false: "false",
    array: ["[", "]"],
    object: ["[", "]"],
    pair: " => ",
};

export function phpArray(entries: [string, string][], level = 0): string {
    const pad = " ".repeat((level + 1) * 4);
    const closePad = " ".repeat(level * 4);
    if (entries.length === 0) {
        return "[]";
    }
    return `[\n${entries.map(([key, value]) => `${pad}${key} => ${value},`).join("\n")}\n${closePad}]`;
}

export function phpList(values: string[], level = 0): string {
    const pad = " ".repeat((level + 1) * 4);
    const closePad = " ".repeat(level * 4);
    return `[\n${values.map((value) => `${pad}${value},`).join("\n")}\n${closePad}]`;
}
