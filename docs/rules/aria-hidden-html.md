---
docType: rule
name: aria-hidden-html
category: a11y
summary: disallow `aria-hidden` from being set on `<html>`
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Disallow `aria-hidden` from being set on `<html>`

Requires `aria-hidden` is not used on the `<html>` element.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="aria-hidden-html"
<html aria-hidden="true"></html>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="aria-hidden-html"
<html></html>
```

## Options

This rule takes no options.

## Version history

- 11.23.0 - Rule added.
