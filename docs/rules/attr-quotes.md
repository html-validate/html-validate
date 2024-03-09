---
docType: rule
name: attr-quotes
category: style
summary: Require attribute quoting
---

# Requires a specific style of attribute quoting

HTML allows different styles for quoting attributes:

- Single-quote `'`:  
  `<div id='foo'>`
- Double-quote `"`:  
  `<div id="foo">`
- Unquoted:  
  `<div id=foo>` (with limitations on allowed content)

This rule unifies which styles are allowed.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attr-quotes">
    <p class='foo'></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attr-quotes">
    <p class="foo"></p>
</validate>

## Options

This rule takes an optional object:

```json
{
  "style": "auto",
  "unquoted": false
}
```

### Style

- `auto` requires usage of double quotes `"` unless the attribute value contains `"` (default).
- `single` requires usage of single quotes `'` for all attributes.
- `double` requires usage of double quotes `"` for all attributes.
- `any` requires usage of either single quotes `'` or double quotes `"` for all attributes.

### Unquoted

If `false` unquoted attributes is disallowed (default).

## Version history

- 7.1.0 - `any` added to `style` option
