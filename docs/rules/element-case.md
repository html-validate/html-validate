---
docType: rule
name: element-case
category: style
summary: Require a specific case for element names
---

# element name case (`element-case`)

Requires a specific case for element names.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-case">
    <DIV>...</DIV>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-case">
    <div>...</div>
</validate>

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
