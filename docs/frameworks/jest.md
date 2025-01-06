---
docType: content
title: Usage with Jest
name: jest
nav: userguide
---

# Usage with Jest

`html-validate` comes with Jest support built-in.

In you test import `html-validate/jest`:

```ts
import "html-validate/jest";
```

This makes all the custom matchers available.

## API

### `toHTMLValidate([error?: Message], [config?: ConfigData], filename?: string)`

Validates a string of HTML and passes the assertion if the markup is valid.

```ts
import "html-validate/jest";

/* --- */

expect("<p></p>").toHTMLValidate();
expect("<p></i>").not.toHTMLValidate();
```

You can also pass jsdom elements:

```ts
import "html-validate/jest";

/* --- */

const elem = document.createElement("div");
expect(elem).toHTMLValidate();
```

::: info

The {@link void-style} rule is disabled by default since jsdom normalizes the style.
It can be enabled by passing a custom configuration reenabling it.

:::

If needed a custom configuration can be passed:

```ts
import "html-validate/jest";

/* --- */

expect("<p></i>").toHTMLValidate({
  rules: {
    "close-order": "off",
  },
});
```

By default configuration is also read from `.htmlvalidate.json` files where the test-case filename is used to match.
This means you can apply transformations using patterns such as `^.*\\.(spec|test).js$`.

If you need to override the filename (perhaps because the test-case isn't in the same folder) you can pass in a custom filename as the third argument:

```ts
import "html-validate/jest";

/* --- */

expect("<p></i>").toHTMLValidate("path/to/my-file.html");
```

Additionally, the `root` configuration property can be used to skip loading from `.htmlvalidate.json` but remember to actually include the rules you need:

```ts
import "html-validate/jest";

/* --- */

expect("<p></i>").toHTMLValidate({
  extends: ["html-validate:recommended"],
  root: true,
});
```

To test for presence of an error always use the negative form `expect(..).not.toHTMLValidate()`.
If you pass in an expected error as the first argument it will be matched using `objectContaining` when an error is present.

```ts
import "html-validate/jest";

/* --- */

/* OK - error matches */
expect("<p></i>").not.toHTMLValidate({
  ruleId: "close-order",
  message: expect.stringContaining("Mismatched close-tag"),
});

/* Fail - wrong error */
expect("<p></i>").not.toHTMLValidate({
  ruleId: "void-style",
  message: expect.stringContaining("Expected omitted end tag"),
});
```

### `toBeValid()`

Assert that a HTML-Validate report is valid.

```ts
import { HtmlValidate } from "html-validate";
import "html-validate/jest";

/* --- */

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></p>");
expect(report).toBeValid();
```

### `toBeInvalid()`

Assert that a HTML-Validate report is invalid.
Inverse of `toBeValid()`.

```ts
import { HtmlValidate } from "html-validate";
import "html-validate/jest";

/* --- */

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></i>");
expect(report).toBeInvalid();
```

### `toHaveError(ruleId: string, message: string, context?: any)`

Assert that a specific error is present in an HTML-Validate report.

```ts
import { HtmlValidate } from "html-validate";

/* --- */

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></i>");
expect(report).toHaveError("close-order", "Mismatched close-tag, expected '</p>' but found '</i>'");
```

### `toHaveErrors(errors: Array<[string, string] | object>)`

Similar to `toHaveError` but but asserts multiple errors.
The passed list must have the same length as the report.
Each error must either be `[ruleId, message]` or an object passed to `expect.objectContaining`.

```ts
import { HtmlValidate } from "html-validate";

/* --- */

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></i>");
expect(report).toHaveErrors([
  ["close-order", "Mismatched close-tag, expected '</p>' but found '</i>'"],
]);
```

or with object syntax:

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></i>");

/* --- */

expect(report).toHaveErrors([
  {
    ruleId: "close-order",
    message: "Mismatched close-tag, expected '</p>' but found '</i>'",
  },
]);
```

### `toMatchCodeframe(snapshot?: string)`

Writes out the given `Report` or `string` using codeframe formatter and compares with snapshot.

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();

/* --- */

const report = htmlvalidate.validateString("...");
expect(report).toMatchCodeframe();
```

or

```ts
expect("...").toMatchCodeframe();
```

### `toMatchInlineCodeframe(snapshot?: string)`

Writes out the given `Report` or `string` using codeframe formatter and compares with inline snapshot.

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();

/* --- */

const report = htmlvalidate.validateString("...");
expect(report).toMatchInlineCodeframe(`
  "error: Attribute \\"FOO\\" should be lowercase (attr-case) at inline:1:6:
  > 1 | <div FOO=\\"bar\\"></div>
      |      ^^^
  Selector: div"
`);
```

or

```ts
expect("...").toMatchInlineCodeframe(`
  "error: Attribute \\"FOO\\" should be lowercase (attr-case) at inline:1:6:
  > 1 | <div FOO=\\"bar\\"></div>
      |      ^^^
  Selector: div"
`);
```
