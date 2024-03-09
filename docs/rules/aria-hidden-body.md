---
docType: rule
name: aria-hidden-body
category: a11y
summary: disallow `aria-hidden` from being set on `<body>`
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Disallow `aria-hidden` from being set on `<body>`

Requires `aria-hidden` is not used on the `<body>` element.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="aria-hidden-body">
    <body aria-hidden="true"></body>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="aria-hidden-body">
    <body></body>
</validate>

## Options

This rule takes no options.

## Version history

-- 6.3.0 - Rule added.
