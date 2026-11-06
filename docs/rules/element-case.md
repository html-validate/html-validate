---
docType: rule
name: element-case
category: style
summary: Require a specific case for element names
---

# Element name case

Requires a specific case for element names.

## Rule details

Examples of **incorrect** code for this rule:

<!-- prettier-ignore -->
```html validate name="incorrect" rules="element-case"
<DIV>...</DIV>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="element-case"
<div>...</div>
```

### Matching case

When using styles such as `pascalcase` the start and end tag must have matching case:

```html validate name="matching" rules="element-case" element-case='{"style": "pascalcase"}'
<FooBar>...</Foobar>
```

### Foreign content

By default, the configured style is not checked for foreign elements, such as SVG and MathML, or their descendants.
Start and end tags must still have matching case.

## Options

This rule takes an optional object:

```json
{
  "style": "lowercase",
  "ignoreForeign": true
}
```

### Style

- `camelcase` requires all element names to be camelCase.
- `lowercase` requires all element names to be lowercase.
- `pascalcase` requires all element names to be PascalCase.
- `uppercase` requires all element names to be UPPERCASE.

Multiple styles can be set as an array of strings.
With multiple styles the element name must match at least one pattern to be considered valid.

For instance, when configured with `{"style": ["lowercase", "pascalcase"]}` element names can be either lowercase or PascalCase:

```html validate name="multiple" rules="element-case" element-case='{"style": ["lowercase", "pascalcase"]}'
<foo-bar></foo-bar>
<FooBar></FooBar>
<fooBar></fooBar>
```

### `ignoreForeign`

- type: `boolean`
- default: `true`

Set to `false` to check the configured style for foreign elements and their descendants.
Start and end tag casing must match regardless of this option.

## Version history

- 11.19.0 - Add `ignoreForeign` option to skip style checks for foreign elements and their descendants by default.
- 11.10.0 - Rule autofixable
