---
docType: content
title: Using API
---

# Using API

## Validating files

```typescript
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateFile("myfile.html");

console.log("valid", report.valid);
if (!report.valid) {
  console.log(report.results);
}
```

`validateFile` is a high-level API which automatically locates configuration
files, load plugins, runs any transformations etc and is very similar to using
the CLI tool (in fact, the CLI tool uses this very API).

A configuration object may optionally be passed to the `HtmlValidate` constructor:

```typescript
const htmlvalidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
});
```

If set, it will be used as configuration unless a configuration could be read from `.htmlvalidate.json` files.
Set `root: true` to prevent configuration files to be searched.

## Validating strings and other sources

In addition to `validateFile` there is also `validateString` and
`validateSource`. Unlike `validateFile` no configuration files will be searched
from the filesystem and the full configuration must be passed to the
`HtmlValidate` constructor.

```typescript
const report = htmlvalidate.validateString("<div>lorem ipsum</span>");
console.log(report.results);
```

```typescript
const report = htmlvalidate.validateSource({
  /* markup to validate */
  data: "<div>lorem ipsum</span>",

  /* filename to put in report, content is not read */
  filename: "myfile.txt",

  /* original source location, i.e. at what position was markup extracted from
   * in original file. */
  line: 12,
  column: 8,
});
console.log(report.results);
```

## Handling multiple files

To validate multiple files you need to call `validateFile` for each one,
obtaining a report for each one. The reports can then be merged together,
forming a new `Report` object.

```typescript
const report1 = htmlvalidate.validateFile("myfile.html");
const report2 = htmlvalidate.validateFile("anotherfile.html");

/* merge reports together to a single report */
const merged = Reporter.merge([report1, report2]);

/* valid is true only if all reports are valid */
console.log("valid", merged.valid);

/* results holds all files */
if (!merged.valid) {
  console.log(merged.results);
}
```

## Formatting reports

HTML-validate comes with a number of builtin formatters:

- `checkstyle`
- `codeframe`
- `json`
- `stylish`
- `text`

Formatters work on the `results` property in a report and all returns a formatted string:

```typescript
import { HtmlValidate, formatterFactory } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateFile("myfile.html");
const text = formatterFactory("text");

console.log(text(report.results));
```

Using the CLI API there is a factory function to retrieve formatters (see `html-validate --help` for details about the format):

```typescript
import { formatterFactory } from "html-validate";

const stylish = formatterFactory("stylish");
console.log(stylish(report));
```

In addition, any ESLint compatible reporter will work:

```typescript
const stylish = require("eslint/lib/formatters/stylish");
console.log(stylish(report.results));
```

## Configuration cache

`HtmlValidate` is mostly stateless, it only acts on the input source and its
configuration.

However, for performance configuration is cached (per instance) and must be
flushed if configuration is changed. Normally this wont matter but when writing
integrations with tools it might be desirable to keep a single instance of
`HtmlValidate` around and in that case the cache needs to be flushed if
configuration changes are detected.

```typescript
/* flush everything */
htmlvalidate.flushConfigCache();

/* flush configuration for a single file */
htmlvalidate.flushConfigCache("myfile.html");
```

## Unit testing

If using jest to write tests there is a couple of helpers to assist writing
tests:

```typescript
import { HtmlValidate } from "html-validate";
import "html-validate/jest";

const config = {
  rules: {
    "my-rule": "error",
  },
};

test("should frobnicate a tux", () => {
  const htmlvalidate = new HtmlValidate(config);
  const report = htmlvalidate.validateString("...");
  expect(report).toBeValid();
});

test("should not frobnicate a flux", () => {
  const htmlvalidate = new HtmlValidate(config);
  const report = htmlvalidate.validateString("...");
  expect(report).toBeInvalid();
  expect(report).toHaveError("my-rule", "the tux should not be frobnicated by a flux");
});
```

## CLI tools

The CLI interface can be wrapped using the `CLI` class.

```js
const cli = new CLI({
  configFile: argv.configFile,
  rules: argv.rules,
});
const htmlvalidate = cli.getValidator();
const formatter = cli.getFormatter(argv.formatter);
const files = cli.expandFiles("**/*.html");
const report = htmlvalidate.validateMultipleFiles(files);
```
