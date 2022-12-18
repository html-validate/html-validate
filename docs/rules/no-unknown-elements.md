---
docType: rule
name: no-unknown-elements
summary: Disallow usage of unknown elements
---

# Disallow usage of unknown elements (`no-unknown-elements`)

This rule requires all elements to have a corresponding metadata element
describing its content model.

All HTML5 elements are bundled and can be used with:

    "extends": ["html5"]

For custom elements (and framework components) you need supply your [own
metadata](../usage/elements.html).

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-unknown-elements">
    <custom-element></custom-element>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-unknown-elements">
    <div></div>
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
Supports wildcard with `*` (e.g. `custom-*`) and regexp with `/../` (e.g. `custom-(foo|bar)`).

### `exclude`

If set elements listed in this array is ignored.
Supports wildcard with `*` (e.g. `custom-*`) and regexp with `/../` (e.g. `custom-(foo|bar)`).

## Version history

- %version% - Added support for `include` and `exclude`.
