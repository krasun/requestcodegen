export type ParseErrorCode = "INVALID_INPUT" | "UNSUPPORTED_INPUT" | "BASE_URL_REQUIRED";

export type GeneratorErrorCode = "INVALID_REQUEST" | "UNSUPPORTED_TARGET";

/**
 * Thrown by parse.curlCommand() and parse.httpRequest(). Messages name the
 * option or field, but never include header values, credentials or bodies.
 */
export class ParseError extends Error {
    readonly code: ParseErrorCode;
    readonly field?: string;

    constructor(code: ParseErrorCode, message: string, field?: string) {
        super(message);
        this.name = "ParseError";
        this.code = code;
        this.field = field;
        Object.setPrototypeOf(this, ParseError.prototype);
    }
}

/**
 * Thrown by generateCode(). Messages name the field or limitation, but never
 * include header values, credentials or bodies.
 */
export class GeneratorError extends Error {
    readonly code: GeneratorErrorCode;
    readonly field?: string;

    constructor(code: GeneratorErrorCode, message: string, field?: string) {
        super(message);
        this.name = "GeneratorError";
        this.code = code;
        this.field = field;
        Object.setPrototypeOf(this, GeneratorError.prototype);
    }
}

export function invalidInput(message: string, field?: string): never {
    throw new ParseError("INVALID_INPUT", message, field);
}

export function unsupportedInput(message: string, field?: string): never {
    throw new ParseError("UNSUPPORTED_INPUT", message, field);
}

export function invalidRequest(message: string, field?: string): never {
    throw new GeneratorError("INVALID_REQUEST", message, field);
}

export function unsupportedTarget(target: string, message: string, field?: string): never {
    throw new GeneratorError("UNSUPPORTED_TARGET", `${target}: ${message}`, field);
}

/**
 * Parsers reuse the request validation, which reports INVALID_REQUEST; for a
 * parser caller that is invalid input.
 */
export function asParseErrors<A extends unknown[], R>(parser: (...args: A) => R) {
    return (...args: A): R => {
        try {
            return parser(...args);
        } catch (error) {
            if (error instanceof GeneratorError && error.code === "INVALID_REQUEST") {
                throw new ParseError("INVALID_INPUT", error.message, error.field);
            }
            throw error;
        }
    };
}
