---
docType: rule
name: void-content
category: content-model
summary: Disallow void element with content
---

# Disallows void element with content (`void-content`)

HTML [void elements](https://www.w3.org/TR/html5/syntax.html#void-contents)
cannot have any content and must not have an end tag.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="void-content">
    <img></img>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="void-content">
    <img>
    <img/>
</validate>
