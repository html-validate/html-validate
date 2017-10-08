# disallows end tags with attributes (`close-attr`)

HTML disallows end tags to have attributes.

## Rule details

Examples of **incorrect** code for this rule:

```html
<div></div id="foo">
```

Examples of **correct** code for this rule:

```html
<div id="foo"></div>
```
