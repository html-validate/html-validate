---
docType: rule
name: no-dup-id
summary: Disallow duplicated IDs
---

# Disallows elements with duplicated ID (`no-dup-id`)

The ID of an element [must be unique](https://www.w3.org/TR/html5/dom.html#the-id-attribute).

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-dup-id">
    <div id="foo"></div>
    <div id="foo"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-dup-id">
    <div id="foo"></div>
    <div id="bar"></div>
</validate>
