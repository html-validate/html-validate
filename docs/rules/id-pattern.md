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

This rule takes an optional object:

```json
{
  "pattern": "kebabcase"
}
```

### Pattern

- type: `string | string[]`
- default: `"kebabcase"`

Either one of the presets or a custom regular expression.

- `"kebabcase"` matches lowercase letters, digits and hyphen (e.g. `kebab-case`)) (default)
- `"camelcase"` matches lowercase letter followed by letters and digits (e.g. `camelCase`)
- `"snakecase"` matches lowercase letters, digits and underscore (e.g. `snake_case`)
- `"bem"` matches [BEM naming convention](https://getbem.com/naming/) (e.g. `block__elem--modifier`)

Read more about {@link pattern details and examples of predefined patterns}.

Multiple patterns can be set as an array.
If value matches either of the patterns it is considered valid.

## Version history

- 8.18.0 - Support `snakecase` (previously `underscore`) and `bem`.
- 8.17.0 - Support multiple patterns.
