---
docType: rule
name: deprecated
category: deprecated
summary: Disallow usage of deprecated elements
standards:
  - html5
---

# Disallow usage of deprecated elements

HTML5 deprecated many old elements.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="deprecated">
    <center>...</center>
    <big>...</big>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="deprecated">
    <main>...</main>
</validate>

## Elements

When using custom elements metadata you can optionally specify a message:

```ts
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-element": {
    deprecated: "replaced with <other-element>",
  },
});
```

The message will be shown alongside the regular message:

<validate name="custom-message" rules="deprecated" elements="deprecated.json">
    <my-element>...</my-element>
</validate>

## Options

This rule takes an optional object:

```json
{
  "include": [],
  "exclude": []
}
```

### `include`

If set only elements listed in this array generates errors.

### `exclude`

If set elements listed in this array is ignored.

## Version history

- v4.11.0 - `include` and `exclude` options added.
- v1.13.0 - Rule added.
