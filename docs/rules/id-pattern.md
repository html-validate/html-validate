---
docType: rule
name: id-pattern
category: style
summary: Require IDs to match a specific pattern
---

# Require a specific ID format

Requires all IDs to match a given pattern.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="id-pattern">
    <div id="fooBar"></foobar>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="id-pattern">
<div id="foo-bar"></div>
</validate>

## Options

This rule takes and optional object:

```json
{
  "pattern": "kebabcase"
}
```

### Pattern

- type: `string | string[]`
- default: `"kebabcase"`

Either one of the presets or a custom regular expression.

- `"kebabcase"` matches lowercase letters, digits and dash (`[a-z0-9-]`) (default)
- `"camelcase"` matches lowercase letter followed by letters and digits (`[a-z][a-zA-Z0-9]`)
- `"underscore"` matches lowercase letters, digits and underscore (`[a-z0-9_]`)

Multiple patterns can be set as an array.
If value matches either of the patterns it is considered valid.

## Version history

- 8.17.0 - Support multiple patterns.
