import { Request } from "../request";
import { generateFetchCode } from "./fetch";

/** Native Node.js fetch() (Node 18+) as an ES module with top-level await. */
export function generateNodeFetchCode(request: Request): string {
    return generateFetchCode(request, "node");
}
