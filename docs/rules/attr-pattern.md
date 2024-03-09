---
docType: rule
name: attr-pattern
category: style
summary: Require attributes to match configured patterns
---

# Attribute name pattern

Require attributes to match configured patterns.
This rule is case-insensitive, for matching case use {@link rules/attr-case}.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attr-pattern">
    <p foo_bar="baz"></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attr-pattern">
    <p foo-bar="baz"></p>
</validate>

## Options

This rule takes an optional object:

```json
{
  "pattern": "[a-z0-9-:]+",
  "ignoreForeign": true
}
```

### `pattern`

- type: `string | string[]`
- default: `[a-z0-9-:]+`

Pattern to match.

Multiple patterns can be set as an array of strings.
With multiple patterns the attribute must match at least one pattern to be considered valid.

For instance, when configured with `{"pattern": ["[a-z0-9-]+", "myprefix-.+"]}` attributes can be either letters and digits or anything with the `myprefix-` prefix:

<validate name="multiple" rules="attr-pattern" attr-pattern='{"pattern": ["[a-z0-9-]+", "myprefix-.+"]}'>
    <p foo-bar-123></p>
    <p myprefix-foo_123!></p>
</validate>

### `ignoreForeign`

By default attributes on foreign elements (such as `<svg>` and `<math>`) are ignored as they follow their own specifications.

Disable this option if you want to validate attributes on foreign elements as well.

## Version history

- v4.14.0 - Rule added.
