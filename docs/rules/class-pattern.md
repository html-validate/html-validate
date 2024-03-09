---
docType: rule
name: class-pattern
category: style
summary: Require classes to match a specific pattern
---

# Require a specific class format

Requires all classes to match a given pattern.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="class-pattern">
    <div class="fooBar"></foobar>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="class-pattern">
    <div class="foo-bar"></div>
</validate>

## Options

This rule takes and optional object:

```json
{
  "pattern": "kebabcase"
}
```

### Pattern

Either one of the presets or a custom regular expression.

- `"kebabcase"` matches lowercase letters, digits and dash (`[a-z0-9-]`) (default)
- `"camelcase"` matches lowercase letter followed by letters and digits (`[a-z][a-zA-Z0-9]`)
- `"underscore"` matches lowercase letters, digits and underscore (`[a-z0-9_]`)
