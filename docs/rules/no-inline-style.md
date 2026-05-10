---
docType: rule
name: no-inline-style
category: style
summary: Disallow inline style
---

# Disallow inline style

Inline style is a sign of unstructured CSS.
Use class or ID with a separate stylesheet.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-inline-style">
    <p style="color: red"></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-inline-style">
    <p class="error"></p>
</validate>

## Options

This rule takes an optional object:

```json
{
  "include": [],
  "exclude": [],
  "allowedProperties": ["display"],
  "allowVariables": true
}
```

Both `include` and `exclude` are only useful when using a framework with dynamic attributes such as `ng-style` or `:style` to allow/disallow one or more specific variant of the attribute.
For instance:

```html
<p :style="style></p>
```

would normally trigger the rule when using {@link frameworks/vue html-validate-vue} but by adding `:style` to `exclude` it can be allowed.

### `include`

If set only attributes listed in this array generates errors.

### `exclude`

If set attributes listed in this array is ignored.

### `allowedProperties`

List of CSS properties to ignore.
If the `style` attribute contains only the properties listed no error will be yielded.

By default `display` is allowed.

<validate name="allowed-properties" rules="no-inline-style">
    <p style="display: none"></p>
</validate>

### `allowVariables`

When `true` (default), CSS custom properties (variables) are allowed in the `style` attribute.
CSS variables are properties whose names start with `--`.

<validate name="allow-variables" rules="no-inline-style">
    <p style="--my-color: red"></p>
</validate>

Setting this option to `false` disallows CSS variables as well:

<validate name="disallow-variables" rules="no-inline-style" no-inline-style='{"allowVariables": false}'>
    <p style="--my-color: red"></p>
</validate>

## Version history

- %version% - `allowVariables` option added
