@ngdoc content
@module rules
@name void
@category style
@summary Disallow void element with content
@description

# disallows void element with content (`void`)

HTML [void elements](https://www.w3.org/TR/html5/syntax.html#void-elements)
cannot have any content and must not have an end tag.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="void">
    <fieldset>
        <input/>
    </fieldset>

    <img></img>

</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="void">
    <fieldset>
        <input>
    </fieldset>

    <img>

</validate>

## Options

This rule takes an optional object:

```javascript
{
	"style": "omit",
}
```

### Style

- `omit` requires end tag to be omitted and disallows self-closing
  elements (default).
- `selfclosing` requests self-closing any void element.
- `any` allows both omitting and self-closing elements.
