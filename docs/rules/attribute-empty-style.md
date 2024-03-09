---
docType: rule
name: attribute-empty-style
category: style
summary: Require a specific style for empty attributes
standards:
  - html5
---

# Empty attribute style

Attributes without a value is implied to be an empty string by the [HTML5 standard][whatwg], e.g. `<a download>` and `<a download="">` are equal.
This rule requires a specific style when writing empty attributes.
Default is to omit the empty string `""`.

This rule does not have an effect on boolean attributes, see {@link attribute-boolean-style} instead.

[whatwg]: https://html.spec.whatwg.org/multipage/syntax.html#attributes-2

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attribute-empty-style">
    <a download=""></a>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attribute-empty-style">
    <a download></a>
</validate>

## Options

This rule takes an optional object:

```json
{
  "style": "omit"
}
```

### Style

- `omit` require empty attributes to omit value, e.g. `<a download></a>`
- `empty` require empty attributes to be empty string, e.g. `<a download=""></a>`
