import { generateClojureCode } from "./generators/clojure";
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
import { generatePHPGuzzleCode } from "./generators/php-guzzle";
import { generatePHPRequestsCode } from "./generators/php-requests";
import { generatePythonCode } from "./generators/python";
import { generatePythonRequestsCode } from "./generators/python-requests";
import { generateRubyCode } from "./generators/ruby";
import { generateRustCode } from "./generators/rust";
import { generateSwiftCode } from "./generators/swift";
import { generateWgetCode } from "./generators/wget";
import { RequestOptions } from "./request";
import { CodeTarget } from "./target";

export function generateCode(
    request: RequestOptions,
    target: CodeTarget
): string {
    switch (target) {
        case CodeTarget.Clojure:
            return generateClojureCode(request);
        case CodeTarget.CSharp:
            return generateCSharpCode(request);
        case CodeTarget.Curl:
            return generateCurlCode(request);
        case CodeTarget.Dart:
            return generateDartCode(request);
        case CodeTarget.Elixir:
            return generateElixirCode(request);
        case CodeTarget.Go:
            return generateGoCode(request);
        case CodeTarget.Java:
            return generateJavaCode(request);
        case CodeTarget.JavaScript:
            return generateJavaScriptCode(request);
        case CodeTarget.Kotlin:
            return generateKotlinCode(request);
        case CodeTarget.NodeHTTP:
            return generateNodeHTTPCode(request);
        case CodeTarget.NodeAxios:
            return generateNodeAxiosCode(request);
        case CodeTarget.NodeFetch:
            return generateNodeFetchCode(request);
        case CodeTarget.ObjectiveC:
            return generateObjectiveCCode(request);
        case CodeTarget.PHP:
            return generatePHPCode(request);
        case CodeTarget.PHPGuzzle:
            return generatePHPGuzzleCode(request);
        case CodeTarget.PHPRequests:
            return generatePHPRequestsCode(request);
        case CodeTarget.Python:
            return generatePythonCode(request);
        case CodeTarget.PythonRequests:
            return generatePythonRequestsCode(request);
        case CodeTarget.Ruby:
            return generateRubyCode(request);
        case CodeTarget.Rust:
            return generateRustCode(request);
        case CodeTarget.Swift:
            return generateSwiftCode(request);
        case CodeTarget.Wget:
            return generateWgetCode(request);
    }
}
