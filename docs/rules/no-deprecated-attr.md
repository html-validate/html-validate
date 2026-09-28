---
docType: rule
name: no-deprecated-attr
category: deprecated
summary: Disallow usage of deprecated attributes
standards:
  - html5
---

# Disallows usage of deprecated attributes

HTML5 deprecated many old attributes.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="no-deprecated-attr"
<body bgcolor="red"></body>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="no-deprecated-attr"
<body style="background: red;"></body>
```
