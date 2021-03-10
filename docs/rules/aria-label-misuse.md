---
docType: rule
name: aria-label-misuse
category: a17y
summary: Disallow `aria-label` misuse
---

# Disallow `aria-label` misuse (`aria-label-misuse`)

`aria-label` is used to set the label of an element when no native text is present or non-descriptive.
The attribute can only be used on the following elements:

- Interactive elements
- Labelable elements
- Landmark elements
- Elements with roles inheriting from widget
- `<area>`
- `<form>` and `<fieldset>`
- `<iframe>`
- `<img>` and `<figure>`
- `<summary>`
- `<table>`, `<td>` and `<th>`

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="aria-label-misuse">
    <input type="hidden" aria-label="foobar">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="aria-label-misuse">
    <input type="text" aria-label="foobar">
</validate>
