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

<validate name="incorrect" rules="element-case">
    <DIV>...</DIV>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-case">
    <div>...</div>
</validate>

### Matching case

When using styles such as `pascalcase` the start and end tag must have matching case:

<validate name="matching" rules="element-case" element-case='{"style": "pascalcase"}'>
    <FooBar>...</Foobar>
</validate>

## Options

This rule takes an optional object:

```json
{
  "style": "lowercase"
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

<validate name="multiple" rules="element-case" element-case='{"style": ["lowercase", "pascalcase"]}'>
    <foo-bar></foo-bar>
    <FooBar></FooBar>
    <fooBar></fooBar>
</validate>
