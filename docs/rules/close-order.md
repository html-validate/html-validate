# disallows elements closed in the wrong order (`close-order`)

HTML requires elements to be closed in the correct order.

## Rule details

Examples of **incorrect** code for this rule:

```html
<p><strong></p></strong>
```

Examples of **correct** code for this rule:

```html
<p><strong></strong></p>
```
