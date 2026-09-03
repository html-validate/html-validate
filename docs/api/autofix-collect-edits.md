---
docType: content
title: "API - autofixCollectEdits function"
id: api:autofixCollectEdits
name: autofixCollectEdits
nav: false
---

# `autofixCollectEdits` function

Collects all text edits requested by a rule autofix callback.
The result is a list of text edits which the caller can use to modify the text.

**Syntax**

```ts nocompile nolint
autofixCollectEdits(fix, text);
```

**Return value**

A promise resolving to the list of `TextEdit` objects requested by the callback, sorted in reverse (descending) offset order.

Throws if any edit has an invalid or out-of-bounds location, or if two edits overlap.

**Parameters**

- `fix: (fixer: ErrorFixer) => void | Promise<void>`: The autofix or suggestion callback, e.g. `message.fix` or `message.suggestions[n].fix`.
- `text: string`: The original source text the fix operates on.

**Example**

Given a `Message` object, e.g. from the result of `htmlvalidate.validateString()`:

```ts
/* eslint-disable unicorn/no-break-in-nested-loop -- makes for an easier example */
import { type Message } from "html-validate";

declare const message: Message & Required<Pick<Message, "fix">>;
declare const text: string;

/* --- */

import { TextEditKind, autofixCollectEdits } from "html-validate";

const edits = await autofixCollectEdits(message.fix, text);

for (const edit of edits) {
  switch (edit.kind) {
    case TextEditKind.Remove:
      /* remove text at location */
      break;
    case TextEditKind.Replace:
      /* replace text at location */
      break;
  }
}
```
