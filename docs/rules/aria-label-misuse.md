---
docType: rule
name: aria-label-misuse
category: a11y
summary: Disallow `aria-label` and `aria-labelledby` misuse
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Disallow `aria-label` and `aria-labelledby` misuse

`aria-label` and `aria-labelledby` are used to set the label of an element when no native text is present or is non-descriptive.
The attribute can only be used on the following elements:

- Interactive elements
- Labelable elements
- Landmark elements
- Elements with roles inheriting from widget
- `<area>`
- `<dialog>`
- `<form>` and `<fieldset>`
- `<iframe>`
- `<img>` and `<figure>`
- `<summary>`
- `<table>`, `<td>` and `<th>`

Additionally, this rule ignores custom elements that explicitly declare `aria-label` in metadata.
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

While some other elements (such as `<h1>`) allow naming with `aria-label` or `aria-labelledby`, it is generally recommended to avoid it:

- It can hide other textual child content of the element from assistive technologies.
- Risk of conflicting information for assistive technologies and what is rendered visually.

The [ARIA Authoring Practices Guide (APG)][apg] strongly recommends to avoid such usage.

To allow `aria-label` or `aria-labelledby` on any element that allows naming, see the [allowAnyNamable](#allowanynamable) option below.￼

[apg]: https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/

## Custom components

When using custom components, if you expect consumers to set `aria-label` or `aria-labelledby` on your component, explicitly declare the `aria-label` attribute:

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

The mere presence of an `aria-label` declaration ensures this rule allows both `aria-label` and `aria-labelledby` on the component.
You do not need to declare `aria-labelledby` explicitly.

## Options

This rule takes an optional object:

```json
{
  "allowAnyNamable": false,
  "elements": {
    "include": null,
    "exclude": null
  }
}
```

### `allowAnyNamable`

- type: `boolean`
- default: `false`

By default this rule disallows `aria-label` or `aria-labelledby` on elements that allow naming but where it is not recommended to do so.

With this option enabled, the following is valid despite not being recommended:

<validate name="any-namable" rules="aria-label-misuse" aria-label-misuse='{"allowAnyNamable": true}'>
	<h1 aria-label="Lorem ipsum">dolor sit amet</h1>
</validate>

This option is disabled by default and `html-validate:recommended` but enabled by `html-validate:standard`.

### `elements.include`

- type: `string[] | null`
- default: `null`

If set, only elements matching the specified patterns will be validated.
Other elements will be ignored.

Patterns can be:

- Literal element names: `["div", "span"]`
- Wildcard patterns: `["custom-*"]` matches any element starting with `custom-`
- Regular expressions: `["/my-.*/"]` matches any element starting with `my-`

With this option set to `["div"]`, only `<div>` elements are validated:

```json
{
  "elements": {
    "include": ["div"]
  }
}
```

<validate name="elements-include" rules="aria-label-misuse" aria-label-misuse='{"elements": {"include": ["div"]}}'>
	<!-- div is validated and will report an error -->
	<div aria-label="Lorem ipsum">dolor sit amet</div>

    <!-- p is ignored, no error despite normally not being allowed -->
    <p aria-label="Lorem ipsum">dolor sit amet</p>

</validate>

### `elements.exclude`

- type: `string[] | null`
- default: `null`

If set, elements matching the specified patterns will be ignored.
Other elements will be validated normally.

Patterns can be:

- Literal element names: `["div", "span"]`
- Wildcard patterns: `["custom-*"]` matches any element starting with `custom-`
- Regular expressions: `["/my-.*/"]` matches any element starting with `my-`

With this option set to `["p"]`, `<p>` elements are ignored:

```json
{
  "elements": {
    "exclude": ["p"]
  }
}
```

<validate name="elements-exclude" rules="aria-label-misuse" aria-label-misuse='{"elements": {"exclude": ["p"]}}'>
	<!-- div is validated and will report an error -->
	<div aria-label="Lorem ipsum">dolor sit amet</div>

    <!-- p is ignored, no error despite normally not being allowed -->
    <p aria-label="Lorem ipsum">dolor sit amet</p>

</validate>

## Version history

- 10.7.0 - `elements.include` and `elements.exclude` options added.
- 10.2.0 - validates `aria-labelledby` in addition to `aria-label`.
- 8.11.0 - `allowAnyNamable` option added.
- 7.17.0 - Allow usage on custom elements.
