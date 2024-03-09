---
docType: rule
name: close-attr
category: syntax
summary: Disallow end tags from having attributes
standards:
  - html5
---

# Disallow end tags from having attributes

HTML disallows end tags to have attributes.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="close-attr">
    <div></div id="foo">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="close-attr">
    <div id="foo"></div>
</validate>
