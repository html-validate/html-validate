---
docType: rule
name: attr-case
category: style
summary: Require a specific case for attribute names
standards:
  - html5
---

# Attribute name case

Requires a specific case for attribute names.
This rule matches case for letters only, for restricting allowed characters use {@link rules/attr-pattern}.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attr-case">
    <p ID="foo"></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attr-case">
    <p id="foo"></p>
</validate>

## Options

This rule takes an optional object:

```json
{
  "style": "lowercase",
  "ignoreForeign": true
}
```

### `style`

- `camelcase` requires all attribute names to be camelCase.
- `lowercase` requires all attribute names to be lowercase.
- `pascalcase` requires all attribute names to be PascalCase.
- `uppercase` requires all attribute names to be UPPERCASE.

Multiple styles can be set as an array of strings.
With multiple styles the attribute must match at least one pattern to be considered valid.

For instance, when configured with `{"style": ["lowercase", "uppercase"]}` attributes can be either lowercase or uppercase:

<validate name="multiple" rules="attr-case" attr-case='{"style": ["lowercase", "uppercase"]}'>
    <p foobar></p>
    <p FOOBAR></p>
    <p fooBar></p>
</validate>

### `ignoreForeign`

By default attributes on foreign elements (such as `<svg>` and `<math>`) are
ignored as they follow their own specifications. For instance, the SVG
specifications uses camelcase for many attributes.

With this option enabled the following is valid despite camelcase attribute:

<validate name="svg-viewbox" rules="attr-case">
	<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />
</validate>

Disable this option if you want to validate attributes on foreign elements as
well.
