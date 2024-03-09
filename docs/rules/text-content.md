---
docType: rule
name: text-content
category: a11y
summary: Require elements to have valid text content
standards:
  - wcag-2.2-aa
  - wcag-2.1-aa
  - wcag-2.0-aa
---

# Require elements to have valid text

Requires presence or absence of textual content on an element (or one of its children).
Whitespace is ignored.

It comes in three variants:

- Text must be absent.
- Text must be present.
- Text must be accessible (regular text or aria attributes).

Bundled HTML5 elements only specify accessible text but custom elements can specify others.

By default this rules validates:

- `<button>`

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="text-content">
	<button type="button"></button>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="text-content">
  <!-- regular static text -->
  <button type="button">Add item</button>

  <!-- text from aria-label -->
  <button type="button" aria-label="Add item">
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
  </button>
</validate>
