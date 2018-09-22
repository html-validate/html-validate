@ngdoc content
@module rules
@name element-required-attributes
@category content-model
@summary Ensure required attributes are set
@description

# Require attribute (`element-required-attributes`)

Ensures required attributes are present but may be empty. Use
[attribute-allowed-values](/rules/attribute-allowed-values.html) to disallow
certain values.

The requirements comes from the [element metadata](/usage/elements.html):

```js
{
  "input": {
    "requiredAttributes": ["type"]
  }
}
```

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-required-attributes">
    <input>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-required-attributes">
    <input type="">
    <input type="text">
</validate>
