---
docType: rule
name: no-redundant-aria-label
category: a11y
summary: Disallow aria-label and label with same text content
---

# Disallow `aria-label` and `<label>` with same text content

Reports error when an input element (`<input>`, `<textarea>` and `<select>`) contains both the `aria-label` attribute and an associated `<label>` element and both have the same text content.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-redundant-aria-label">
    <label for="foo"> lorem ipsum </label>
    <input id="foo" aria-label="lorem ipsum" />
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-redundant-aria-label">
    <!-- different texts -->
    <label for="foo"> lorem ipsum </label>
    <input id="foo" aria-label="screenreader text" />

    <!-- only label -->
    <label for="foo"> lorem ipsum </label>
    <input id="foo" />

</validate>

## Version history

- 8.1.0 - Rule added.
