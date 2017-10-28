@ngdoc content
@module rules
@name no-deprecated-attr
@summary Disallow usage of deprecated attributes
@description

# disallows usage of deprecated attributes (`no-deprecated-attr`)

HTML5 deprecated many old attributes.

## Rule details

Examples of **incorrect** code for this rule:

```html
<body bgcolor="red"></body>
```

Examples of **correct** code for this rule:

```html
<body style="background: red;"></body>
```
