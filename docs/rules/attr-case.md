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

```html
<p ID="foo"></p>
```

Examples of **correct** code for this rule:

```html
<p id="foo"></p>
```

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
