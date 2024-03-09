---
docType: rule
name: attribute-boolean-style
category: style
summary: Require a specific style for boolean attributes
standards:
  - html5
---

# Boolean attribute style

Boolean attributes are attributes without a value and the presence of the attribute is considered a boolean `true` and absence a boolean `false`.
The [HTML5 standard][whatwg] allows three styles to write boolean attributes:

- `<input required>` (omitting the value)
- `<input required="">` (empty string)
- `<input required="required">` (attribute name)

This rule requires a specific style when writing boolean attributes.
Default is to omit the value.

This rule does not have an effect on regular attributes with empty values, see {@link attribute-empty-style} instead.

[whatwg]: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attribute-boolean-style">
    <input required="">
    <input required="required">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attribute-boolean-style">
    <input required>
</validate>

## Options

This rule takes an optional object:

```json
{
  "style": "omit"
}
```

### Style

- `omit` require boolean attributes to omit value, e.g. `<input required>`
- `empty` require boolean attributes to be empty string, e.g. `<input required="">`
- `name` require boolean attributes to be the attributes name, e.g. `<input required="required">`
