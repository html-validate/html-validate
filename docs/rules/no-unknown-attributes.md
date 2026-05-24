---
docType: rule
name: no-unknown-attributes
summary: Disallow usage of unknown attributes
---

# Disallow usage of unknown attributes

> **Experimental**: This rule is still in an early stage. If you encounter false positives or missing attributes, please [file a bug report](https://gitlab.com/html-validate/html-validate/-/issues).

This rule requires all attributes used on an element to be valid for that element.
Global HTML attributes (e.g. `id`, `class`, `style`, `hidden`) are included automatically.

Elements without metadata (e.g. custom elements) are ignored.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-unknown-attributes">
	<div unknown="value"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-unknown-attributes">
	<div id="foo" class="bar" hidden></div>
	<input type="text" name="username" />
</validate>

## Exceptions

Currently this rule ignores:

- `:attr`
- `#slot`
- `@event`
- `ng-*`
- `v-*`
- `x-*`
- `[attr]`

## Version history

- 10.17.0 - Rule added.
