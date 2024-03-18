---
docType: rule
name: name-pattern
category: style
summary: Require form control names to match a specific pattern
---

# Require form control names to match a specific pattern

Requires all names on form controls to match a given pattern.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="name-pattern">
    <input name="foo-bar">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="name-pattern">
    <input name="fooBar">
</validate>

## Options

This rule takes and optional object:

```json
{
  "pattern": "camelcase"
}
```

### Pattern

Either one of the presets or a custom regular expression.

- `"kebabcase"` matches lowercase letters, digits and dash (`[a-z0-9-]`) (default)
- `"camelcase"` matches lowercase letter followed by letters and digits (`[a-z][a-zA-Z0-9]`)
- `"underscore"` matches lowercase letters, digits and underscore (`[a-z0-9_]`)

Optional array brackets are always allowed:

<validate name="array-brackets" rules="name-pattern">
    <input name="fooBar[]">
</validate>

## Version history

- %version% - Rule added.
