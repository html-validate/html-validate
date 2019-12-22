---
docType: rule
name: no-unknown-elements
summary: Disallow usage of unknown elements
---

# Disallow usage of unknown elements (`no-unknown-elements`)

This rule requires all elements to have a corresponding metadata element
describing its content model.

All HTML5 elements are bundled and can be used with:

    "extends": ["html5"]

For custom elements (and framework components) you need supply your [own
metadata](../usage/elements.html).

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-unknown-elements">
    <custom-element></custom-element>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-unknown-elements">
    <div></div>
</validate>
