---
docType: rule
name: attribute-allowed-values
category: content-model
summary: Validate permitted attribute values
standards:
  - html5
---

# Allowed attribute values

Validates attributes for allowed values.
Enumerated string values are matched case insensitive while regular expressions are matched case sensitive unless `/i` is used.

Use [element-required-attributes](/rules/element-required-attributes.html) to validate presence of attributes.

The requirements comes from the [element metadata](/usage/elements.html):

```json
{
  "input": {
    "attributes": {
      "type": {
        "enum": ["text", "email", "..."]
      }
    }
  }
}
```

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="attribute-allowed-values"
<a href>...</a>

<input type="foobar" />
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="attribute-allowed-values"
<a href="page.html">...</a>

<input type="text" />
```
