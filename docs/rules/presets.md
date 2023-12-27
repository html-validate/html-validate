---
docType: presets
name: Configuration presets
---

# Configuration presets

HTML-validate comes with a few predefined presets.

Presets can be configured using:

```json config
{
  "extends": ["html-validate:PRESET"]
}
```

Multiple presets can be set and will be enabled in the order they appear in `"extends"`.
See {@link usage configuration usage guide} for more details.

## Available presets

### `html-validate:recommended`

This is the default preset and enables most rules including standards validation, WCAG and best practices.
It is a superset of the other presets.

### `html-validate:standard`

Enables rules related to validating according to the WHATWG HTML standard (Living Standard).

Use this preset if you want validation similar to the Nu Html Checker and similar tools.

### `html-validate:prettier`

- Since: v7.18.0

If you are using [Prettier][prettier] to format your HTML markup you can use this preset to disable contradicting rules such as {@link rule:void-style}.

This preset if meant to be used in combination with another preset such as `html-validate:recommended` as it only disables rules.

[prettier]: https://prettier.io/

### `html-validate:a11y`

Enables rules related to accessibility.
Most rules but not all enabled rules relates to WCAG compliance.
On its own it will not validate if the document/template itself is valid but only if accessibility issues can be found.

This preset should be used together with `html-validate:standard` to ensure the document structure is valid (a requirement of WCAG) and if possible `html-validate:document` (to ensure references are valid, etc).

### `html-validate:document`

Enables rules requiring a full document to validate, i.e. not a partial template.
Examples include missing doctype and invalid references.

Use this preset together with other presets for full coverage.
This preset is enabled by plugins such as {@link usage/cypress cypress-html-validate} and {@link usage/protractor protractor-html-validate}.

## Comparison
