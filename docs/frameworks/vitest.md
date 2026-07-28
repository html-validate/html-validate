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

::: warning Note

Note that all matchers are asynchronous and the result must either be awaited or the promise returned.

:::

## Configuration

When passing in string as input the string is validated with `HtmlValidate.validateString()` with the current test filename as the `filename` parameter.

E.g., a test in `awesome-test.spec.ts`:

```ts
const markup = "..";
await expect(markup).toBeValid();
```

would be equivalent to:

```ts
import { type HtmlValidate } from "html-validate";

declare const htmlvalidate: HtmlValidate;

/* --- */

const markup = "..";
htmlvalidate.validateString(markup, "awesome-test.spec.ts");
```

When using {@link flat-configuration flat configuration} this can be used to override configuration for tests:

```ts
import { defineFlatConfig } from "html-validate";

export default defineFlatConfig([
  {
    files: ["**/*.spec.ts"],
    rules: {/* specific configuration only for tests */},
  },
]);
```

By default, the following rules are always disabled:

- `void-style`

## API

See {@link jest} API for a list of matchers.

### toBeValid

- Type: `() => Promise<void>`

`toBeValid()` asserts that a string or report does not contain any errors.

```ts
import { expect, it } from "vitest";
import "html-validate/vitest";

it("should be valid", async () => {
  const markup = "<p></p>";
  await expect(markup).toBeValid();
});
```

When asserting a string, the string is first validated using `HtmlValidate.validateString()`.
When asserting an existing `Report` object, it is asserted directly.

### toBeInvalid

- Type: `() => Promise<void>`

`toBeInvalid()` asserts that a string or report contains one or more errors.

```ts
import { expect, it } from "vitest";
import "html-validate/vitest";

it("should not be valid", async () => {
  const markup = "<div>";
  await expect(markup).toBeInvalid();
});
```

When asserting a string, the string is first validated using `HtmlValidate.validateString()`.
When asserting an existing `Report` object, it is asserted directly.

### toMatchCodeframe

- Type: `(hint?: string) => Promise<void>`

This ensures validation result matches a codeframe formatted snapshot.

When passing in a `Report` object it is formatted with codeframe and compared with a snapshot.
When passing in a `string` it is first validated before formatting.

```ts
import { type HtmlValidate } from "html-validate";

declare const htmlvalidate: HtmlValidate;

/* --- */

it("should match snapshot", async () => {
  const report = await htmlvalidate.validateString("<div>");
  await expect(report).toMatchCodeframe();
});
```

::: warning Note

Requires Vitest v4.1.3 or later.

:::

### toMatchInlineCodeframe

- Type: `(snapshot?: string) => Promise<void>`

This ensures validation result matches a codeframe formatted snapshot.

When passing in a `Report` object it is formatted with codeframe and compared with an inline snapshot.
When passing in a `string` it is first validated before formatting.

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

::: warning Note

Requires Vitest v4.1.3 or later.

:::

## Version history

- 11.6.0 - `toBeValid()` and `toBeInvalid()` matches can take string as input.
- 11.2.0 - `toMatchCodeframe` and `toMatchInlineCodeframe` matchers added (requires Vitest v4.1.3 or later).
- 11.0.0 - Support for Vitest v1 and v2 removed.
- 10.2.0 - Support for Vitest v4 added.
- 9.2.0 - Support for Vitest v3 added.
- 8.5.0 - Vitest experimental support added.
