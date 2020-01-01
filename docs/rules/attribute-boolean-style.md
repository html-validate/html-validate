@ngdoc rule
@name attribute-boolean-style
@category style
@summary Require a specific style for boolean attributes
@description

# Boolean attribute style (`attribute-boolean-style`)

Require a specific style when writing boolean attributes.

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

```javascript
{
	"style": "omit"
}
```

### Style

- `omit` require boolean attributes to omit value, e.g. `<input required>`
- `empty` require boolean attributes to be empty string, e.g. `<input required="">`
- `name` require boolean attributes to be the attributes name, e.g. `<input required="required">`
