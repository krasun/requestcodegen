import OpenAI from "openai";
import { CodeTarget } from "../target";
import { readFile, realpath, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { cleanUpMarkdownCode } from "../code";

if (!process.env.OPENAI_MODEL) {
    throw new Error(`OPENAI_MODEL is required`);
}

const model = process.env.OPENAI_MODEL;

async function main() {
    const [path] = process.argv.slice(2);
    const targetPath = await realpath(path);

    const openai = new OpenAI({
        baseURL: process.env.OPENAI_BASE_URL,
        apiKey: process.env.OPENAI_API_KEY,
    });

    for (const entry of Object.entries(CodeTarget)) {
        const [target, readableName] = entry;

        const fileName = resolveFileName(readableName);
        const filePath = join(targetPath, fileName) + ".ts";
        let code: string | null = null;
        if (!existsSync(filePath)) {
            code = await generateCode(openai, target, readableName);
            if (!code) {
                throw new Error(`Failed to generate code for ${readableName}`);
            }

            await writeFile(filePath, addImports(code));
        } else {
            code = await readFile(filePath, "utf8");
        }

        if (!code) {
            continue;
        }

        const testFilePath = join(targetPath, fileName) + ".test.ts";
        if (existsSync(testFilePath)) {
            continue;
        }

        const testCode = await generateTestCode(openai, code);
        if (!testCode) {
            continue;
        }

        await writeFile(
            testFilePath,
            addTestImports(testCode, fileName, `generate${target}Code`)
        );
    }
}

function resolveFileName(target: string): string {
    return target
        .replaceAll("(", "")
        .replaceAll(")", "")
        .replaceAll(" ", "-")
        .replaceAll("#", "sharp")
        .toLowerCase();
}

function addImports(code: string) {
    return `import { RequestOptions } from "../request";

${code}`;
}

function addTestImports(
    code: string,
    fromModule: string,
    functionName: string
) {
    return `import { describe, expect, test } from "@jest/globals";
import { ${functionName} } from "./${fromModule}";    

${code}`;
}

async function generateTestCode(openai: OpenAI, code: string) {
    const prompt = `Generate jest test functions for following code: ${code}
    
    1. Don't explain, just return the code.
    2. Use the test function instead of the it function.
    3. Don't import any library, only write tests.
    4. Wrap tests with "describe" function.
    5. Don't write any comments or explanations, like "Here is" and so on.
    6. At least 5 test cases.
    7. Don't test with empty options.`;

    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        model,
        stream: false,
    });

    const result = chatCompletion.choices[0].message.content;

    return result ? cleanUpMarkdownCode(result) : null;
}

async function generateCode(
    openai: OpenAI,
    targetName: string,
    readableTargetName: string
) {
    const prompt = `Implement function generate${targetName}Code 
    in TypeScript that generate a code example for ${readableTargetName}.
    
    1. Return only the function body. 
    2. Don't explain the code. 
    3. Return just the code of the generate${targetName}Code function.
    4. Don't start with "Here's", no need to explain anything. Just return the code.
    5. Don't print response result, just check for errors and that's it. No need do anything with the response variable.    

    interface RequestOptions {
        url: string;
        query?: Record<string, string|string[]>;
        method?: string; // 'POST', 'PUT' or 'GET'
        headers?: Record<string, string>;
        body?: string;
    }

    export function generate${targetName}Code(options: RequestOptions): string {
        // implement it: return only the function with its declaration without any additional text or quotes, 
        just as s raw string, not in the Markdown format.
        // add all necessary imports
    }`;

    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        model,
        stream: false,
    });

    const result = chatCompletion.choices[0].message.content;

    return result ? cleanUpMarkdownCode(result) : null;
}

main()
    .then()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
