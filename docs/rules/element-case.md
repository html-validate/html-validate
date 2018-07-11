@ngdoc content
@module rules
@name element-case
@category style
@summary Require a specific case for element names
@description

# element name case (`element-case`)

Requires a specific case for element names.

## Rule details

Examples of **incorrect** code for this rule:

```html
<DIV>...</DIV>
```

Examples of **correct** code for this rule:

```html
<div>...</div>
```

## Options

This rule takes an optional object:

```javascript
{
	"style": "lowercase"
}
```

### Style

- `lowercase` requires all element names to be lowercase.
- `uppercase` requires all element names to be uppercase.
