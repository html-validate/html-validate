---
docType: content
title: "API - isAutofix function"
id: api:isAutofix
name: isAutofix
nav: devguide
---

# `isAutofix` function

Tests if a value is an `Autofix` instance.

**Syntax**

```ts nocompile nolint
isAutofix(value);
```

**Return value**

`true` if the value is an `Autofix` instance.

**Parameters**

- `value: unknown`: The value to test.

**Example**

```ts
import { createAutofix, isAutofix } from "html-validate";

const text = '<div foo="bar"></div>';
const fix = createAutofix(text, (fixer) => {
  fixer.replaceText({ filename: "inline", offset: 5, line: 1, column: 6, size: 3 }, "lorem");
});

console.log(isAutofix(fix)); // true

const fn = (): void => {
  /* do nothing */
};

console.log(isAutofix(fn)); // false
```
