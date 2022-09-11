---
docType: rule
name: aria-hidden-body
category: a11y
summary: requires `aria-hidden` not to be used on `<body>`
---

# Attribute name case (`aria-hidden-body`)

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
