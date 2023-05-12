---
docType: rule
name: aria-label-misuse
category: a11y
summary: Disallow `aria-label` misuse
---

# Disallow `aria-label` misuse (`aria-label-misuse`)

`aria-label` is used to set the label of an element when no native text is present or non-descriptive.
The attribute can only be used on the following elements:

- Interactive elements
- Labelable elements
- Landmark elements
- Elements with roles inheriting from widget
- `<area>`
- `<form>` and `<fieldset>`
- `<iframe>`
- `<img>` and `<figure>`
- `<summary>`
- `<table>`, `<td>` and `<th>`

Additionally, this rule ignores elements which explicitly declare an `aria-label` attribute.
See the section on [custom components](#custom-components) below.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="aria-label-misuse">
    <input type="hidden" aria-label="foobar">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="aria-label-misuse">
    <input type="text" aria-label="foobar">
</validate>

## Custom components

When using custom components and you expect consumers to set `aria-label` on your component you need to explicitly declare the `aria-label` attribute:

```ts
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "awesome-component": {
    attributes: {
      "aria-label": {},
    },
  },
});
```

The mere presence of `aria-label` declaration ensures this rule will allow `aria-label` to be specified.

## Version history

- %version% - Allow usage on custom elements.
