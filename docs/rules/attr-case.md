@ngdoc content
@module rules
@name attr-case
@category style
@summary Require a specific case for attribute names
@description

# attribute name case (`attr-case`)

Requires a specific case for attribute names.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attr-case">
    <p ID="foo"></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attr-case">
    <p id="foo"></p>
</validate>

## Options

This rule takes an optional object:

```javascript
{
	"style": "lowercase"
}
```

### Style

- `lowercase` requires all attribute names to be lowercase.
- `uppercase` requires all attribute names to be uppercase.
