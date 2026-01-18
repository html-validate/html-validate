---
docType: rule
name: valid-for
category: document
summary: Require <label> to reference a labelable form control
standards:
  - html5
---

# Require label for attribute to reference a labelable form control

The `<label>` element's `for` attribute must reference a labelable form control.

According to the HTML specification, the `for` attribute should reference elements that can be [labeled](https://html.spec.whatwg.org/multipage/forms.html#category-label), such as:

- `<input>` (except `type="hidden"`)
- `<textarea>`
- `<select>`
- `<button>`
- `<output>`
- `<meter>`
- `<progress>`

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="valid-for">
  <label for="foo">Lorem ipsum</label>
  <p id="foo">dolor sit amet</p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="valid-for">
  <label for="foo">Lorem ipsum</label>
  <input type="text" id="foo">
</validate>

## Version history

- %version% - Rule added.
