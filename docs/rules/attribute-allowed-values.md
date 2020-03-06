---
docType: rule
name: attribute-allowed-values
category: content-model
summary: Validate permitted attribute values
---

# Allowed attribute values (`attribute-allowed-values`)

Validates attributes for allowed values. Use
[element-required-attributes](/rules/element-required-attributes.html) tog
validate presence of attributes.

The requirements comes from the [element metadata](/usage/elements.html):

```js
{
  "input": {
    "attributes": {
      "type": ["text", "email", "..."]
    }
  }
}
```

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attribute-allowed-values">
    <a href>...</a>
    <input type="foobar">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attribute-allowed-values">
    <a href="page.html">...</a>
    <input type="text">
</validate>
