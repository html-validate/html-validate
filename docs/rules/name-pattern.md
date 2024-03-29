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

Array brackets are ignored by this rule:

<validate name="array-brackets" rules="name-pattern">
    <input name="fooBar[]">
</validate>

## Options

This rule takes an optional object:

```json
{
  "pattern": "camelcase"
}
```

### Pattern

- type: `string | string[]`
- default: `"camelcase"`

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
- 8.17.0 - Rule added.
