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

## Other namable elements

While some other elements (such as `<h1>`) allows naming with `aria-label` it is generally recommended to avoid it:

- It can hide other textual child content of the element from assistive technologies.
- Risk of conflicting information for assistive technologies and what is rendered visually.

The [ARIA Authoring Practices Guide (APG)][apg] strongly recommends to avoid such usage.

To allow `aria-label` on any element which allows naming see the [allowAnyNamable][#allow-any-namable] option below.

[apg]: https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/

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

## Options

This rule takes an optional object:

```json
{
  "allowAnyNamable": false
}
```

### `allowAnyNamable`

By default this rule disallows `aria-label` on elements which allows naming but for which it is not recommended to do so.

With this option enabled the following is valid despite not recommended:

<validate name="any-namable" rules="aria-label-misuse" aria-label-misuse='{"allowAnyNamable": true}'>
	<h1 aria-label="Lorem ipsum">dolor sit amet</h1>
</validate>

This option is disabled by default and `html-validate:recommended` but enabled by `html-validate:standard`.

## Version history

- %version% - `allowAnyNamable` option added.
- 7.17.0 - Allow usage on custom elements.
