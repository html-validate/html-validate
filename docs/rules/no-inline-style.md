@ngdoc content
@module rules
@name no-inline-style
@category style
@summary Disallow inline style
@description

# disallow inline style (`no-inline-style`)

Inline style is a sign of unstructured CSS. Use class or ID with a separate
stylesheet.

## Rule details

Examples of **incorrect** code for this rule:

```html
<p style="color: red"></p>
```

Examples of **correct** code for this rule:

```html
<p class="error"></p>
```
