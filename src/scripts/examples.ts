import { writeFile } from "fs/promises";
import { CodeTarget } from "../target";

import { generateCode, RequestOptions } from "../generator";

async function main() {
    const [outputPath] = process.argv.slice(2);
    if (!outputPath) {
        throw new Error("Output path is required");
    }

    const examples: Record<string, string> = {};

    const options: RequestOptions = {
        url: "http://example.com",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "John Doe" }),
    };

    for (const [target, readableName] of Object.entries(CodeTarget)) {
        const code = await generateCode(options, readableName as CodeTarget);
        if (!code) {
            throw new Error(`Failed to generate code for ${target}`);
        }

        examples[target] = code;
    }

    let markdownContent = "# Code Examples\n\n";

    for (const [target, code] of Object.entries(examples)) {
        const targetName = CodeTarget[target as keyof typeof CodeTarget];
        markdownContent += `## ${targetName}\n\n\`\`\`${target}\n${code}\n\`\`\`\n\n`;
    }

    await writeFile(outputPath, markdownContent);
}

main()
    .then()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
