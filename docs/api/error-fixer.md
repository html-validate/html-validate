---
docType: content
title: API - ErrorFixer interface
id: api:ErrorFixer
name: ErrorFixer
nav: false
---

# `ErrorFixer` interface

Methods to modify the original source to fix errors.

## `replaceText` method

Replaces the text at location.

**Syntax**

```ts nocompile nolint
replaceText(location, replacement);
```

**Return value**

This method has no return value.

**Parameters**

- `location: Location`: The location of text to replace.
- `replacement: string`: The text to replace current text with.

**Example**

```ts
import { type ErrorFixer, type Location } from "html-validate";

declare const fixer: ErrorFixer;
declare const location: Location;

/* --- */

/* replace the text at given location with "lorem ipsum" */
fixer.replaceText(location, "lorem ipsum");
```
