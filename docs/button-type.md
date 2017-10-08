# require button element to have a valid type (`close-order`)

HTML button defaults to `type="submit"` when attribute is missing or invalid
which may not be the intended type.

## Rule details

Examples of **incorrect** code for this rule:

```html
<!-- missing type -->
<button>...</button>

<!-- invalid type -->
<button type="foo">...</button>
```

Examples of **correct** code for this rule:

```html
<button type="button">...</button>
```
