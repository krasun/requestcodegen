import { Request } from "../request";
import { generateFetchCode } from "./fetch";

/**
 * Browser fetch() as an ES module (top-level await). Headers the browser
 * controls itself (Cookie, Origin, Referer, Sec-*, ...) are left out; a
 * Cookie header becomes credentials: "include".
 */
export function generateJavaScriptCode(request: Request): string {
    return generateFetchCode(request, "browser");
}
