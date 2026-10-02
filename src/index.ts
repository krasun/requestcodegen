import { asParseErrors } from "./errors";
import { parseCurlCommand } from "./parsers/curl";
import { parseHttpRequest } from "./parsers/http";

export { generateCode } from "./generator";
export { GeneratorError, ParseError } from "./errors";
export type { GeneratorErrorCode, ParseErrorCode } from "./errors";
export type { RequestOptions } from "./request";
export { CodeTarget } from "./target";

/**
 * Parsers that turn request text into a plain RequestOptions object. They
 * throw ParseError.
 */
export const parse = Object.freeze({
    /** Parses a single Bash-style curl command. Nothing is executed and no file is read. */
    curlCommand: asParseErrors(parseCurlCommand),
    /**
     * Parses raw HTTP/1.x request text. A path target is resolved against
     * `baseUrl`, or against https://<Host> when no base URL is given.
     */
    httpRequest: asParseErrors(parseHttpRequest),
});
