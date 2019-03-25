@ngdoc rule
@module rules
@name attr-quotes
@category style
@summary Require attribute quoting
@description

# requires a specific style of attribute quoting (`attr-quotes`)

HTML allows different styles for quoting attributes:

- Single-quote `'`:  
  `<div id='foo'>`
- Double-quote `"`:  
  `<div id="foo">`
- Unquoted `'`:  
  `<div id=foo>` (with limitations on allowed content)

This rule unifies which styles are allowed.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attr-quotes">
    <p class='foo'></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attr-quotes">
    <p class="foo"></p>
</validate>

## Options

This rule takes an optional object:

```javascript
{
	"style": "double",
	"unquoted": false
}
```

### Style

- `single` requires usage of `'` for all attributes.
- `double` requires usage of `"` for all attributes (default).

### Unquoted

If `false` unquoted attributes is disallowed (default).
