export function cleanUpMarkdownCode(code: string): string {
    if (!code.startsWith("```")) {
        return code;
    }

    const codeBlockRegex = /```[a-zA-Z]+\n([\s\S]*?)```/g;

    let match = codeBlockRegex.exec(code);
    let cleanedCode = "";
    while (match != null) {
        cleanedCode += match[1] + "\n";
        match = codeBlockRegex.exec(code);
    }

    return cleanedCode.trim();
}

export function generateComparableCode(s: string) {
    // remove non-printable and whitespace characters
    return s.replace(/[\s\x00-\x1F\x7F-\x9F]/g, "");
}
