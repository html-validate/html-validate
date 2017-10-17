# disallow invalid element names (`element-name`)

HTML defines what content is considered a valid (custom) [element
name](https://www.w3.org/TR/custom-elements/#valid-custom-element-name), essentially:

- Must start with `a-z`.
- Must contain a dash `-`.

Elements with xml namespaces is ignored by this rule.

## Rule details

Examples of **incorrect** code for this rule:

```html
<foobar></foobar>
```

Examples of **correct** code for this rule:

```html
<div></div>
<foo-bar></foo-bar>
```

## Options

This rule takes and optional object:

```javascript
{
    "pattern": "[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$",
    "whitelist": [],
    "blacklist": []
}
```

### Pattern

A regular expression for matching valid names. If changed you should ensure it
still fulfills the original HTML specification, in particular requiring a `-`.

### Whitelist

Elements in the whitelist will never trigger this rule even if it would not
match the pattern.

### Blacklist

Elements in the blacklist will always trigger this rule.
