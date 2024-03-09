---
docType: rule
name: element-required-attributes
category: content-model
summary: Ensure required attributes are set
standards:
  - html5
---

# Ensure required attributes are set

Ensures required attributes are present but may be empty.
Use {@link rule:attribute-allowed-values} rule to disallow certain values.

The requirements comes from the {@link usage/elements element metadata}:

```json
{
  "img": {
    "attributes": {
      "src": {
        "required": true
      }
    }
  }
}
```

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-required-attributes">
    <img>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-required-attributes">
    <img src="cat.gif">
</validate>
