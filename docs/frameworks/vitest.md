---
docType: content
title: Usage with Vitest
name: vitest
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
All matchers except `toMatchCodeframe` and `toMatchInlineCodeframe` are available.

## Version history

- 8.5.0 - Vitest experimental support added.
