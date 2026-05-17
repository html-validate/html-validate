---
docType: content
title: Usage with Vitest
name: vitest
nav: userguide
---

# Usage with Vitest

`html-validate` comes with experimental Vitest support built-in.
For now the API is the same as Jest but this might change in future versions.
Don't hesitate to [report new issues](https://gitlab.com/html-validate/html-validate/-/issues/new) if you find something that isn't working as expected.

In you test or setup-file import `html-validate/vitest`:

```ts
import "html-validate/vitest";
```

This makes all the custom matchers available.

## API

See {@link jest} API for a list of matchers.

### `toMatchCodeframe(hint?: string)`

When passing in a `Report` object it is formatted with codeframe and compared with a snapshot.
When passing in a `string` it is first validated before formatting.

::: warning Note

Note that this matcher is asynchronous and the result must either be awaited or the promise returned.

Requires Vitest v4.1.3 or later.

:::

```ts
import { type HtmlValidate } from "html-validate";

declare const htmlvalidate: HtmlValidate;

/* --- */

it("should match snapshot", async () => {
  const report = await htmlvalidate.validateString("<div>");
  await expect(report).toMatchCodeframe();
});
```

### `toMatchInlineCodeframe(snapshot?)`

When passing in a `Report` object it is formatted with codeframe and compared with an inline snapshot.
When passing in a `string` it is first validated before formatting.

::: warning Note

Note that this matcher is asynchronous and the result must either be awaited or the promise returned.

Requires Vitest v4.1.3 or later.

:::

```ts
import { type HtmlValidate } from "html-validate";

declare const htmlvalidate: HtmlValidate;

/* --- */

it("should match inline snapshot", async () => {
  const report = await htmlvalidate.validateString("<div>");
  await expect(report).toMatchInlineCodeframe(`
    "error: Unclosed element '<div>' (close-order)
    > 1 | <div>
        |  ^^^
    Selector: div"
  `);
});
```

## Version history

- 11.2.0 - `toMatchCodeframe` and `toMatchInlineCodeframe` matchers added (requires Vitest v4.1.3 or later).
- 11.0.0 - Support for Vitest v1 and v2 removed.
- 10.2.0 - Support for Vitest v4 added.
- 9.2.0 - Support for Vitest v3 added.
- 8.5.0 - Vitest experimental support added.
