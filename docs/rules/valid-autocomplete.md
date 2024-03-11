---
docType: rule
name: valid-autocomplete
category: syntax
summary: Require autocomplete attribute to be valid
standards:
  - html5
---

# Require autocomplete attribute to be valid

The HTML5 `autocomplete` attribute can be used in different ways:

- On a `<form>` element it can take the `on` or `off` values to set the default for all nested controls.
- On form controls it can either take `on` or `off` to enable and disable or it can take a number of space-separated tokens describing what type of autocompletion to use.
- With the exception that `<input type="hidden">` cannot use `on` or `off`.

Further the space-separated tokens must appear in the following order:

- An optional section name (`section-` prefix).
- An optional `shipping` or `billing` token.
- An optional `home`, `work`, `mobile`, `fax` or `pager` token (for field names supporting it).
- A required field name.
- An optional `webauthn` token.

Typical field names would be:

- `name`
- `username`
- `current-password`
- `address-line1`
- `country-name`
- etc

For a full list of valid field names refer to the HTML5 standard [Autofill][html5-autofill] section.

Some field names can only be used on specific input controls, for instance:

- A `new-password` field cannot be used on `<input type="number">`
- A `cc-exp-month` field cannot be used on `<input type="date">`
- etc

Again, refer to the Autofill section in the standard for a full table of allowed controls.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="valid-autocomplete">
    <input type="text" autocomplete="foo">
    <input type="text" autocomplete="name billing">
    <input type="text" autocomplete="street-address">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="valid-autocomplete">
    <input type="text" autocomplete="name">
    <input type="text" autocomplete="billing name">
    <textarea autocomplete="street-address"></textarea>
</validate>

## References

- [HTML5 section 4.10.18.7: Autofill][html5-autofill]

## Version history

- 8.15.0 - Rule added.

[html5-autofill]: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
