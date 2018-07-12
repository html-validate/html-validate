@ngdoc content
@module rules
@name missing-doctype
@category document
@summary Require document to have a doctype
@description

# Require a doctype for the document (`missing-doctype`)

Requires that the document contains a doctype.

## Rule details

Examples of **incorrect** code for this rule:

```html
<html>
<body>...</body>
</html>
```

Examples of **correct** code for this rule:

```html
<!doctype html>
<html>
<body>...</body>
</html>
```
