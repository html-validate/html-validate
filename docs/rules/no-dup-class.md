---
docType: rule
name: no-dup-class
category: syntax
summary: Disallow duplicated classes
---

# Disallows duplicated classes on same element

Prevents unnecessary duplication of class names.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="no-dup-class"
<div class="foo bar foo"></div>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="no-dup-class"
<div class="foo bar"></div>
```
