---
docType: rule
name: input-attributes
category: content-model
summary: Validates usage of input attributes
standards:
  - html5
---

# Validates usage of input attributes

The `<input>` element uses the `type` attribute to set what type of input field it is.
Depending on what type of input field it is many other attributes is allowed or disallowed.

For instance, the `step` attribute can be used with numerical fields but not with textual input.

This rule validates the usage of these attributes, ensuring the attributes are used only in the proper context.

See [HTML5 specification][whatwg] for a table of attributes and types.

[whatwg]: https://html.spec.whatwg.org/multipage/input.html#concept-input-apply

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="input-attributes">
    <input type="text" step="5">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="input-attributes">
    <input type="number" step="5">
</validate>

## Version history

- v4.14.0 - Rule added.
