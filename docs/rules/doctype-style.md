---
docType: rule
name: doctype-style
category: style
summary: Require a specific case for DOCTYPE
---

# Require a specific case for DOCTYPE

While DOCTYPE is case-insensitive in the standard this rule requires it to be a specific style.
The standard consistently uses uppercase which is the default style for this rule.

Mixed case it not supported.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="doctype-style">
    <!Doctype html>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="doctype-style">
	<!DOCTYPE html>
</validate>

## Options

This rule takes an optional object:

```json
{
  "style": "uppercase"
}
```

### `style`

- `uppercase` requires DOCTYPE to be uppercase.
- `lowercase` requires DOCTYPE to be lowercase.
