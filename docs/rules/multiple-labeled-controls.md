---
docType: rule
name: multiple-labeled-controls
category: a11y
summary: Disallow labels associated with multiple controls
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Disallow labels associated with multiple controls

`<label>` can only be associated with a single control at once.
It should either wrap a single [labelable][] control or use the `for` attribute to reference the control.

[labelable]: https://html.spec.whatwg.org/multipage/forms.html#category-label

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect-multiple" rules="multiple-labeled-controls">
  <label>
    <input type="text">
    <input type="text">
  </label>
</validate>

<validate name="incorrect-both" rules="multiple-labeled-controls">
  <label for="bar">
    <input type="text" id="foo">
  </label>
  <input type="text" id="bar">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="multiple-labeled-controls">
  <label>
    <input type="text">
  </label>
</validate>
