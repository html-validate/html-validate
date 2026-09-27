---
docType: content
title: API - ErrorFixer interface
id: api:ErrorFixer
name: ErrorFixer
nav: devguide
---

# `ErrorFixer` interface

Methods to modify the original source to fix errors.

## `insertTextBefore` method

Inserts text at just before location.

### Syntax {#inserttextbefore-syntax}

```ts nocompile nolint
insertTextBefore(location, insert);
```

### Return value {#inserttextbefore-return-value}

This method has no return value.

### Parameters {#inserttextbefore-parameters}

- `location: Location`: The location where text will be inserted at.
- `insert: string`: The text to insert.

### Example {#inserttextbefore-example}

```ts
import { type ErrorFixer, type Location } from "html-validate";

declare const fixer: ErrorFixer;
declare const location: Location;

/* --- */

/* inserts "before" to just before given location */
fixer.insertTextBefore(location, "before");
```

If `location` refers to the word "ipsum", the following change would be applied:

```diff
-lorem ipsum dolor sit amet
+lorem beforeipsum dolor sit amet
```

## `insertTextAfter` method

Inserts text at just after location.

### Syntax {#inserttextafter-syntax}

```ts nocompile nolint
insertTextAfter(location, insert);
```

### Return value {#inserttextafter-return-value}

This method has no return value.

### Parameters {#inserttextafter-parameters}

- `location: Location`: The location where text will be inserted at.
- `insert: string`: The text to insert.

### Example {#inserttextafter-example}

```ts
import { type ErrorFixer, type Location } from "html-validate";

declare const fixer: ErrorFixer;
declare const location: Location;

/* --- */

/* inserts "after" to just after given location */
fixer.insertTextAfter(location, "after");
```

If `location` refers to the word "ipsum", the following change would be applied:

```diff
-lorem ipsum dolor sit amet
+lorem ipsumafter dolor sit amet
```

## `replaceText` method

Replaces the text at location.

### Syntax {#replacetext-syntax}

```ts nocompile nolint
replaceText(location, replacement);
```

### Return value {#replacetext-return-value}

This method has no return value.

### Parameters {#replacetext-parameters}

- `location: Location`: The location of text to replace.
- `replacement: string`: The text to replace current text with.

### Example {#replacetext-example}

```ts
import { type ErrorFixer, type Location } from "html-validate";

declare const fixer: ErrorFixer;
declare const location: Location;

/* --- */

/* replace the text at given location with "lorem ipsum" */
fixer.replaceText(location, "lorem ipsum");
```

## `renameTag` method

Renames the tag of an element, updating both the start tag and the end tag (if present).
Attributes are left untouched even if they are not valid on the renamed element.

Elements without an end tag (void elements, elements with optional end tags, etc) only get the start tag renamed.
Elements implicitly opened by the parser (such as an omitted `<body>`) are not present in the source and are ignored.

### Syntax {#renametag-syntax}

```ts nocompile nolint
renameTag(element, newName);
```

### Return value {#renametag-return-value}

This method has no return value.

### Parameters {#renametag-parameters}

- `element: HtmlElement`: The element to rename.
- `newName: string`: The new tag name.

### Example {#renametag-example}

Given the following markup:

```html
<div class="foo"></div>
```

To rename the element:

```ts
import { type ErrorFixer, type HtmlElement } from "html-validate";

declare const fixer: ErrorFixer;
declare const element: HtmlElement;

/* --- */

fixer.renameTag(element, "span");
```

Resulting in:

```html
<span class="foo"></span>
```

## `removeText` method

Removes the text at location, optionally trimming whitespace before or after.

### Syntax {#removetext-syntax}

```ts nocompile nolint
removeText(location, [options]);
```

### Return value {#removetext-return-value}

This method has no return value.

### Parameters {#removetext-parameters}

- `location: Location`: The location of text to remove.
- `options.trimStart: boolean` (optional): Remove whitespace characters before the specified location, up to and including a single newline if present.
  Defaults to `false`.
- `options.trimEnd: boolean` (optional): Remove whitespace characters after the specified location, up to and including a single newline if present.
  Defaults to `false`.

### Example {#removetext-example}

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
