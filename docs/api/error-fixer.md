---
docType: content
title: API - ErrorFixer interface
id: api:ErrorFixer
name: ErrorFixer
nav: devguide
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

## `removeText` method

Removes the text at location, optionally trimming whitespace before or after.

**Syntax**

```ts nocompile nolint
removeText(location, [options]);
```

**Return value**

This method has no return value.

**Parameters**

- `location: Location`: The location of text to remove.
- `options.trimStart: boolean` (optional): Remove whitespace characters before the specified location, up to and including a single newline if present. Defaults to `false`.
- `options.trimEnd: boolean` (optional): Remove whitespace characters after the specified location, up to and including a single newline if present. Defaults to `false`.

**Example**

Given an element with the `foo` attribute:

```html
<div foo="bar"></div>
```

To remove the attribute:

```ts
import { type Attribute, type ErrorFixer } from "html-validate";

declare const fixer: ErrorFixer;
declare const attr: Attribute;

/* --- */

fixer.removeText(attr.location);
```

After removal the result would be:

<!-- prettier-ignore -->
```html
<div ></div>
```

The whitespace before the attribute can be trimmed:

```ts
import { type Attribute, type ErrorFixer } from "html-validate";

declare const fixer: ErrorFixer;
declare const attr: Attribute;

/* --- */

fixer.removeText(attr.location, { trimStart: true });
```

Resulting in `<div>` instead of `<div >`:

```html
<div></div>
```
