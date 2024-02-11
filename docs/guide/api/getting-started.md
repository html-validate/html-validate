---
docType: content
title: Getting started with API
nav: devguide
---

# Getting started with API

This guide shows how to use the API to validate markup and present the result.

## Prerequisites

1. Create a new directory.
2. Initialize npm (`npm init -y`).
3. Edit the `package.json` file to add `"type": "module"`.
4. Install `html-validate` library (`npm install html-validate`).

## Import and initialize library

```ts
import { HtmlValidate } from "html-validate";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const htmlvalidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    "doctype-style": "off",
    "attr-quotes": "off",
    "no-trailing-whitespace": "off",
    "void-style": "warn",
  },
});
```

This creates a new instance of `HtmlValidate` configured with the given configuration.
The configuration is the same as when {@link usage configuring the CLI tool}.

## Validating HTML

To validate markup use one of the `validate*` functions, e.g. use `validateString` to validate markup from a string:

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();

/* --- */

const markup = /* HTML */ `
  <h1>Hello & goodbye!</h1>
  <input type='text'></input>
`;
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const report = await htmlvalidate.validateString(markup);
```

If we run this, `report` will contain an object like this:

```jsonc
{
  "valid": false,
  "results": [
    /* ... */
  ],
  "errorCount": 2,
  "warningCount": 0,
}
```

- `valid` will be `true` if the markup is valid or only has warnings. If any errors are present it will be `false`.
- `errorCount` and `warningCount` gives a count of how many errors and warnings respectively.

If you are validating multiple sources (e.g. multiple files) this will be a summary of all sources.
That is, if there are one or more errors, `valid` will be `false` and `errorCount` and `warningCount` will be the sum of all files.

`results` contains a list of all markup:

```jsonc
{
  "valid": false,
  "results": [
    {
      "filePath": "inline",
      "messages": [
        /* ... */
      ],
      "errorCount": 2,
      "warningCount": 0,
      "source": "\n  <h1>Hello & goodbye!</h1>\n  <input type='text'></input>\n",
    },
  ],
  "errorCount": 2,
  "warningCount": 0,
}
```

When validating a single string only, a single item will be present in the array with a special `filePath` `"inline"` (for inline validation, as opposed to a file on disk).
The item will always be there even if there is no errors or warnings present.
It is therefor always safe to access `report.results[0]`, e.g.:

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = await htmlvalidate.validateString("");

/* --- */

console.log(report.results[0]);
```

- `errorCount` and `warningCount` give a count of how many errors and warnings there are, respectively, for this specific source.
- `source` is the string being validated (useful in case you use `validateFile` or otherwise doesn't have the input string).

`messages` contains the actual errors and warnings:

```jsonc
{
  "valid": false,
  "results": [
    {
      "filePath": "inline",
      "messages": [
        {
          "ruleId": "no-raw-characters",
          "severity": 2,
          "message": "Raw \"&\" must be encoded as \"&amp;\"",
          "offset": 13,
          "line": 2,
          "column": 13,
          "size": 1,
          "selector": "h1",
          "ruleUrl": "https://html-validate.org/rules/no-raw-characters.html",
        },
        {
          "ruleId": "void-content",
          "severity": 2,
          "message": "End tag for <input> must be omitted",
          "offset": 51,
          "line": 3,
          "column": 23,
          "size": 6,
          "selector": null,
          "ruleUrl": "https://html-validate.org/rules/void-content.html",
          "context": "input",
        },
      ],
      "errorCount": 2,
      "warningCount": 0,
      "source": "\n  <h1>Hello & goodbye!</h1>\n  <input type='text'></input>\n",
    },
  ],
  "errorCount": 2,
  "warningCount": 0,
}
```

- `ruleId` is the unique name of the rule (same as when configuring).
- `severity` is set to 1 when it is a warning and 2 when it is an error.
- `message` is the actual error message.
- `line` and `column` is the line and column (1 indexed, e.g. 1 refers to the first line).
- `offset` is the number of characters into the string (0 indexed); can be used as an index into the original string.
- `size` is the number of characters this error refers to.
- `selector` is a unique CSS selector this error refers to. If no selector is possible it is set to `null`.
- `ruleUrl` is a URL to a page describing the error in detail.
- `context` is a contextual data blob for use with `HtmlValidate.getContextualDocumentation(..)` to give a more accurate error description.

## Displaying the results

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = await htmlvalidate.validateString("");

/* --- */

const severity = ["", "Warning", "Error"];

if (!report.valid) {
  console.log(`${report.errorCount} error(s), ${report.warningCount} warning(s)\n`);
  console.log("─".repeat(60));
  for (const result of report.results) {
    const lines = (result.source ?? "").split("\n");
    for (const message of result.messages) {
      const marker = message.size === 1 ? "▲" : "━".repeat(message.size);
      console.log();
      console.log(severity[message.severity], `(${message.ruleId}):`, message.message);
      console.log(message.ruleUrl);
      console.log();
      console.log(lines[message.line - 1]);
      console.log(`${" ".repeat(message.column - 1)}${marker}`);
      console.log();
      console.log("─".repeat(60));
    }
  }
}
```

Here, we loop over each result and print the errors and warnings.

## Putting it all together

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    "doctype-style": "off",
    "attr-quotes": "off",
    "no-trailing-whitespace": "off",
    "void-style": "warn",
  },
});

const markup = /* HTML */ `
  <h1>Hello & goodbye!</h1>
  <input type='text'></input>
`;
const report = await htmlvalidate.validateString(markup);

const severity = ["", "Warning", "Error"];

if (!report.valid) {
  console.log(`${report.errorCount} error(s), ${report.warningCount} warning(s)\n`);
  console.log("─".repeat(60));
  for (const result of report.results) {
    const lines = (result.source ?? "").split("\n");
    for (const message of result.messages) {
      const marker = message.size === 1 ? "▲" : "━".repeat(message.size);
      console.log();
      console.log(severity[message.severity], `(${message.ruleId}):`, message.message);
      console.log(message.ruleUrl);
      console.log();
      console.log(lines[message.line - 1]);
      console.log(`${" ".repeat(message.column - 1)}${marker}`);
      console.log();
      console.log("─".repeat(60));
    }
  }
}
```

Running this displays:

```
2 error(s), 0 warning(s)

────────────────────────────────────────────────────────────

Error (no-raw-characters): Raw "&" must be encoded as "&amp;"
https://html-validate.org/rules/no-raw-characters.html

  <h1>Hello & goodbye!</h1>
            ▲

────────────────────────────────────────────────────────────

Error (void-content): End tag for <input> must be omitted
https://html-validate.org/rules/void-content.html

  <input type='text'></input>
                      ━━━━━━

────────────────────────────────────────────────────────────
```
