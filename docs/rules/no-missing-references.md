---
docType: rule
name: no-missing-references
category: document
summary: Require all element references to exist
standards:
  - html5
---

# No missing references

Require all elements referenced by attributes such as `for` to exist in the current document.

Checked attributes:

- `label[for]`
- `input[list]`
- `*[aria-activedescendant]`
- `*[aria-controls]`
- `*[aria-describedby]`
- `*[aria-details]`
- `*[aria-errormessage]`
- `*[aria-flowto]`
- `*[aria-labelledby]`
- `*[aria-owns]`

A current limitation is that only the `<title>` and `<desc>` elements from an SVG can be referenced.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-missing-references">
    <label for="missing-input"></label>
    <div aria-labelledby="missing-text"></div>
    <div aria-describedby="missing-text another-missing"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-missing-references">
    <label for="my-input"></label>
    <div id="verbose-text"></div>
    <div id="another-text"></div>
    <div aria-labelledby="verbose-text"></div>
    <div aria-describedby="verbose-text another-text"></div>
    <input id="my-input">
</validate>

## Version history

- 6.6.0 - Handle SVG `<title>` and `<desc>`
- 5.5.0 - Extended list of checked aria attributes.
