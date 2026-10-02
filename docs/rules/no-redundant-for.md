---
docType: rule
name: no-redundant-for
category: syntax
summary: Disallow usage of redundant label for attributes
standards:
  - html5
---

# Disallow usage of redundant label for attributes

`<label>` can either use the `for` attribute to reference the labelable control or wrap it.
Doing both is redundant as the label already references the control.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="no-redundant-for"
<label for="foo">
  <input type="checkbox" id="foo" />
  My fancy checkbox
</label>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="no-redundant-for"
<!-- without for attribute -->
<label>
  <input type="checkbox" />
  My fancy checkbox
</label>

<!-- without wrapping -->
<input type="checkbox" id="foo" />
<label for="foo"> My fancy checkbox </label>
```
