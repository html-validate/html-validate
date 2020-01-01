@ngdoc rule
@name attribute-allowed-values
@category content-model
@summary Validate permitted attribute values
@description

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
    <input type="foobar">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attribute-allowed-values">
    <input type="text">
</validate>
