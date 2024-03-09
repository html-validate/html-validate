---
docType: rule
name: no-dup-attr
category: syntax
summary: Disallow duplicated attributes
standards:
  - html5
---

# Disallows duplicated attributes on same element

HTML [disallows](https://www.w3.org/TR/html5/syntax.html#attributes-0) two or
more attributes with the same (case-insensitive) name.

Browsers handles duplication differently and thus this is a source for bugs.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-dup-attr">
    <div class="foo" class="bar"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-dup-attr">
    <div class="foo bar"></div>
</validate>
