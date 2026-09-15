---
docType: content
title: "API - createAutofix function"
id: api:createAutofix
name: createAutofix
nav: devguide
---

# `createAutofix` function

Manually create an `Autofix` instance.

The purpose of this function is to be used when writing unittests related to autofixing.
For normal usage the `fix` or `suggestions` properties of the `Message` objects should be used.

It is undefined behavior to reuse the same `fix` parameter, or to reuse it for other purposes.

**Syntax**

```ts nocompile nolint
createAutofix(text, fix);
```

**Return value**

An `Autofix` instance.

**Parameters**

- `text: string`: The source text the callback operates on.
- `fix: (fixer: ErrorFixer) => void | Promise<void>`: The autofix callback.

**Example**

```ts
import { createAutofix } from "html-validate";

const text = '<div foo="bar"></div>';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- example */
const fix = createAutofix(text, (fixer) => {
  fixer.replaceText({ filename: "inline", offset: 5, line: 1, column: 6, size: 3 }, "lorem");
});
```
