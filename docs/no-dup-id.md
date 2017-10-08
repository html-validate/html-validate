# disallows elements width duplicated ID (`no-dup-id`)

The ID of an element [must be unique](https://www.w3.org/TR/html5/dom.html#the-id-attribute).

## Rule details

Examples of **incorrect** code for this rule:

```html
<div id="foo"></div>
<div id="foo"></div>
```

Examples of **correct** code for this rule:

```html
<div id="foo"></div>
<div id="bar"></div>
```
