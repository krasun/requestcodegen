import { generateGoCode } from "./generators/go";

export interface RequestOptions {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}

export async function generateCode(
    request: RequestOptions,
    target: string
): Promise<string> {
    switch (target.toLowerCase()) {
        case "go":
            return generateGoCode(request);
        default:
            throw new Error(`Unsupported target: ${target}`);
    }
}
