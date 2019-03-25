@ngdoc rule
@module rules
@name attr-case
@category style
@summary Require a specific case for attribute names
@description

# attribute name case (`attr-case`)

Requires a specific case for attribute names.

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

```javascript
{
	"style": "lowercase",
	"ignoreForeign": true
}
```

### `style`

- `lowercase` requires all attribute names to be lowercase.
- `uppercase` requires all attribute names to be uppercase.

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
