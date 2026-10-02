import { writeFile } from "fs/promises";
import { CodeTarget, generateCode, RequestOptions } from "../index";

async function main() {
    const [outputPath] = process.argv.slice(2);
    if (!outputPath) {
        throw new Error("Output path is required");
    }

    const requests: Record<string, RequestOptions> = {
        GET: {
            url: "https://example.com",
            method: "GET",
            query: {
                baz: ["qux", "quix"],
                foo: "bar",
            },
        },
        POST: {
            url: "https://example.com",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: "John Doe", baz: ["qux", "quix"] }),
        },
    };

    let markdown = "# Code Examples\n\n";
    for (const [key, target] of Object.entries(CodeTarget)) {
        for (const [method, request] of Object.entries(requests)) {
            markdown += `## ${target} (${method})\n\n\`\`\`${key}\n${generateCode(request, target)}\n\`\`\`\n\n`;
        }
    }

    await writeFile(outputPath, markdown);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
