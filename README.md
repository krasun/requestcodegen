# requestcode

[![Build](https://github.com/krasun/requestcode/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/krasun/requestcode/actions/workflows/build.yml)
[![NPM package](https://img.shields.io/npm/v/requestcode.svg?branch=main)](https://www.npmjs.com/package/requestcode)

`requestcode` is a library to generate HTTP client example code in different programming languages.

## Install

```shell
npm install requestcode --save
```

## Use

Using the library is as easy as:

```typescript
import { generateCode } from "requestcode";

const clojureCodeExample = generateCode(
    { url: "http://example.com", method: "POST" },
    CodeTarget.Clojure
);
```

## Build and publish (a manual for developers)

To build and publish the library:

1. Bump the version property in the `package.json` file.
2. Run `npm run prepare`.
3. Run `npm publish`.

## Generate code

```shell
OPENAI_MODEL=<model> OPENAI_BASE_URL="<OpenAI API base URL>" OPENAI_API_KEY="OpenAI API key" npm run generate src/generators
```

# Known usages

A few examples of how the library is used:

1. [ScreenshotOne](https://screenshotone.com) uses the library for generating code examples in the playground for the screenshot API.

If you use the library, please, don't hesitate to share how and in what project.

## License

`krasun/requestcode` is released under [the MIT license](LICENSE).
