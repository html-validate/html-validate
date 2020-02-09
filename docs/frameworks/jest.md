---
docType: content
title: Usage with Jest
---

# Usage with Jest

`html-validate` comes with Jest support built-in.

In you test import `html-validate/jest`:

```js
import "html-validate/jest";
```

This makes all the custom matchers available.

## API

### `toHTMLValidate(config?: ConfigData, filename?: string)`

Validates a string of HTML and passes the assertion if the markup is valid.

```js
expect("<p></p>").toHTMLValidate();
expect("<p></i>").not.toHTMLValidate();
```

You can also pass jsdom elements:

```js
const elem = document.createElement("div");
expect(elem).toHTMLValidate();
```

If needed a custom configuration can be passed:

```js
expect("<p></i>").toHTMLValidate({
  rules: {
    "close-order": "off",
  },
});
```

By default configuration is also read from `.htmlvalidate.json` files where the test-case filename is used to match.
If you need to override this (perhaps because the test-case isn't in the same folder) you can pass in a custom filename as the third argument:

```js
expect("<p></i>").toHTMLValidate(null, "path/to/my-file.html");
```

This can also be used to apply transformations to the markup.

Additionally, the `root` configuration property can be used to skip loading from `.htmlvalidate.json` but remember to actually include the rules you need:

```js
expect("<p></i>").toHTMLValidate({
  extends: ["html-validate:recommended"],
  root: true,
});
```

### `toBeValid()`

Assert that a HTML-Validate report is valid.

```js
const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></p>");
expect(report).toBeValid();
```

### `toBeInvalid()`

Assert that a HTML-Validate report is invalid.
Inverse of `toBeValid()`.

```js
const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></i>");
expect(report).toBeInvalid();
```

### `toHaveError(ruleId: string, message: string, context?: any)`

Assert that a specific error is present in an HTML-Validate report.

```js
const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></i>");
expect(report).toHaveError(
  "close-order",
  "Mismatched close-tag, expected '</p>' but found '</i>'"
);
```

### `toHaveErrors(errors: Array<[string, string] | object>)`

Similar to `toHaveError` but but asserts multiple errors.
The passed list must have the same length as the report.
Each error must either be `[ruleId, message]` or an object passed to `expect.objectContaining`.

```js
const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString("<p></i>");
expect(report).toHaveErrors([
  ["close-order", "Mismatched close-tag, expected '</p>' but found '</i>'"],
]);
```

or with object syntax:

```js
expect(report).toHaveErrors([
  {
    ruleId: "close-order",
    message: "Mismatched close-tag, expected '</p>' but found '</i>'",
  },
]);
```
