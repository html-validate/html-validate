---
docType: rule
name: autocomplete-password
category: security
summary: Require autocomplete attribute on password inputs
---

# Require autocomplete attribute on password inputs

Password input fields should have a proper `autocomplete` attribute to control browser password autofill behavior.

Browsers and password managers often ignore `autocomplete="off"` for password fields and autofill them anyway.
This can lead to unexpected behavior where users unknowingly submit autofilled passwords for unrelated fields.

This rule ensures that:

1. All `<input type="password">` elements have an `autocomplete` attribute
2. The `autocomplete` attribute is not set to `"off"`
3. Optionally, the `autocomplete` value matches a configured preferred value

See [HTML specification][html-autocomplete] for more information about autocomplete tokens.

[html-autocomplete]: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="autocomplete-password">
	<input type="password">
	<input type="password" autocomplete="off">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="autocomplete-password">
	<input type="password" autocomplete="new-password">
</validate>

## Options

This rule takes an optional object:

```json
{
  "preferred": null
}
```

### `preferred`

When set, this option requires all password inputs to use a specific autocomplete value.

Examples of **incorrect** code with `{ "preferred": "new-password" }`:

<validate name="incorrect-preferred" rules="autocomplete-password" autocomplete-password='{"preferred": "new-password"}'>
	<input type="password" autocomplete="current-password">
</validate>

Examples of **correct** code with `{ "preferred": "new-password" }`:

<validate name="correct-preferred" rules="autocomplete-password" autocomplete-password='{"preferred": "new-password"}'>
	<input type="password" autocomplete="new-password">
</validate>

## Version history

- 10.8.0 - Rule added.
