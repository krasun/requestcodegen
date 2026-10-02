import { GeneratorError } from "./errors";
import { generateClojureCode } from "./generators/clojure";
import {
    ClientDefaults,
    requireAsciiHeaders,
    requireDefaultFlags,
} from "./generators/common";
import { generateCSharpCode } from "./generators/csharp";
import { generateCurlCode } from "./generators/curl";
import { generateDartCode } from "./generators/dart";
import { generateElixirCode } from "./generators/elixir";
import { generateGoCode } from "./generators/go";
import { generateJavaCode } from "./generators/java";
import { generateJavaScriptCode } from "./generators/javascript";
import { generateKotlinCode } from "./generators/kotlin";
import { generateNodeAxiosCode } from "./generators/node-axios";
import { generateNodeFetchCode } from "./generators/node-fetch";
import { generateNodeHTTPCode } from "./generators/node-http";
import { generateObjectiveCCode } from "./generators/objective-c";
import { generatePHPCode } from "./generators/php";
import { generatePHPCurlCode } from "./generators/php-curl";
import { generatePHPGuzzleCode } from "./generators/php-guzzle";
import { generatePHPRequestsCode } from "./generators/php-requests";
import { generatePythonCode } from "./generators/python";
import { generatePythonRequestsCode } from "./generators/python-requests";
import { generateRubyCode } from "./generators/ruby";
import { generateRustCode } from "./generators/rust";
import { generateSwiftCode } from "./generators/swift";
import { generateWgetCode } from "./generators/wget";
import { Request, toRequest } from "./request";
import { RequestOptions } from "./request";
import { CodeTarget } from "./target";

type Generator = (request: Request) => string;

/**
 * For generators that only produce their client's default redirect and
 * compression behavior: rejects explicit values that differ from it.
 */
function withClientDefaults(
    target: CodeTarget,
    defaults: ClientDefaults,
    generate: Generator,
    { asciiHeaders = false } = {}
): Generator {
    return (request) => {
        requireDefaultFlags(target, request, defaults);
        if (asciiHeaders) {
            requireAsciiHeaders(target, request.headers);
        }
        return generate(request);
    };
}

const GENERATORS: Record<CodeTarget, Generator> = {
    [CodeTarget.Curl]: generateCurlCode,
    [CodeTarget.PythonRequests]: generatePythonRequestsCode,
    [CodeTarget.JavaScript]: generateJavaScriptCode,
    [CodeTarget.NodeFetch]: generateNodeFetchCode,
    [CodeTarget.NodeAxios]: generateNodeAxiosCode,
    [CodeTarget.PHPCurl]: generatePHPCurlCode,
    [CodeTarget.PHPGuzzle]: generatePHPGuzzleCode,
    [CodeTarget.Wget]: withClientDefaults(
        CodeTarget.Wget,
        { followRedirects: true, compressed: false },
        generateWgetCode
    ),
    [CodeTarget.Clojure]: withClientDefaults(
        CodeTarget.Clojure,
        { followRedirects: true, compressed: true },
        generateClojureCode
    ),
    [CodeTarget.CSharp]: withClientDefaults(
        CodeTarget.CSharp,
        { followRedirects: true, compressed: false },
        generateCSharpCode
    ),
    [CodeTarget.Dart]: withClientDefaults(
        CodeTarget.Dart,
        { followRedirects: true, compressed: true },
        generateDartCode
    ),
    [CodeTarget.Elixir]: withClientDefaults(
        CodeTarget.Elixir,
        { followRedirects: false, compressed: false },
        generateElixirCode
    ),
    [CodeTarget.Go]: withClientDefaults(
        CodeTarget.Go,
        { followRedirects: true, compressed: true },
        generateGoCode
    ),
    [CodeTarget.Java]: withClientDefaults(
        CodeTarget.Java,
        { followRedirects: true, compressed: false },
        generateJavaCode
    ),
    [CodeTarget.Kotlin]: withClientDefaults(
        CodeTarget.Kotlin,
        { followRedirects: true, compressed: false },
        generateKotlinCode
    ),
    [CodeTarget.NodeHTTP]: withClientDefaults(
        CodeTarget.NodeHTTP,
        { followRedirects: false, compressed: false },
        generateNodeHTTPCode,
        { asciiHeaders: true }
    ),
    [CodeTarget.ObjectiveC]: withClientDefaults(
        CodeTarget.ObjectiveC,
        { followRedirects: true, compressed: true },
        generateObjectiveCCode
    ),
    [CodeTarget.PHP]: withClientDefaults(
        CodeTarget.PHP,
        { followRedirects: true, compressed: false },
        generatePHPCode
    ),
    [CodeTarget.PHPRequests]: withClientDefaults(
        CodeTarget.PHPRequests,
        { followRedirects: true, compressed: true },
        generatePHPRequestsCode
    ),
    [CodeTarget.Python]: withClientDefaults(
        CodeTarget.Python,
        { followRedirects: true, compressed: false },
        generatePythonCode,
        { asciiHeaders: true }
    ),
    [CodeTarget.Ruby]: withClientDefaults(
        CodeTarget.Ruby,
        { followRedirects: false, compressed: true },
        generateRubyCode
    ),
    [CodeTarget.Rust]: withClientDefaults(
        CodeTarget.Rust,
        { followRedirects: true, compressed: false },
        generateRustCode
    ),
    [CodeTarget.Swift]: withClientDefaults(
        CodeTarget.Swift,
        { followRedirects: true, compressed: true },
        generateSwiftCode,
        { asciiHeaders: true }
    ),
};

/**
 * Generates example code that sends the request with the target's HTTP
 * client. The request is validated and never mutated.
 */
export function generateCode(request: RequestOptions, target: CodeTarget): string {
    const generate = Object.prototype.hasOwnProperty.call(GENERATORS, target)
        ? GENERATORS[target]
        : undefined;
    if (!generate) {
        throw new GeneratorError(
            "UNSUPPORTED_TARGET",
            `Unknown code target: ${String(target)}.`,
            "target"
        );
    }
    return generate(toRequest(request));
}
