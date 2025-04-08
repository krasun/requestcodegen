import { writeFile } from "fs/promises";
import { CodeTarget } from "../target";

import { generateCode, JsonBody, RequestOptions } from "../generator";

async function main() {
    const [outputPath] = process.argv.slice(2);
    if (!outputPath) {
        throw new Error("Output path is required");
    }

    const examples: Record<string, string> = {};

    const options: { post: RequestOptions; get: RequestOptions } = {
        post: {
            url: "http://example.com",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: new JsonBody({ name: "John Doe", baz: ["qux", "quix"] }),
        },
        get: {
            url: "http://example.com",
            method: "GET",
            query: {
                baz: ["qux", "quix"],
                foo: "bar",
            },
        },
    };
    for (const [target, readableName] of Object.entries(CodeTarget)) {
        const postCode = await generateCode(
            options.post,
            readableName as CodeTarget
        );
        if (!postCode) {
            throw new Error(`Failed to generate POST code for ${target}`);
        }
        const getCode = await generateCode(
            options.get,
            readableName as CodeTarget
        );
        if (!getCode) {
            throw new Error(`Failed to generate GET code for ${target}`);
        }

        examples[`${target}_post`] = postCode;
        examples[`${target}_get`] = getCode;
    }

    let markdownContent = "# Code Examples\n\n";

    for (const [target, code] of Object.entries(examples)) {
        const isPost = target.endsWith("_post");
        const isGet = target.endsWith("_get");
        const baseTarget =
            isPost || isGet
                ? target.substring(0, target.lastIndexOf("_"))
                : target;
        const targetName = CodeTarget[baseTarget as keyof typeof CodeTarget];
        const methodType = isPost ? " (POST)" : isGet ? " (GET)" : "";

        markdownContent += `## ${targetName}${methodType}\n\n\`\`\`${baseTarget}\n${code}\n\`\`\`\n\n`;
    }

    await writeFile(outputPath, markdownContent);
}

main()
    .then()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
