---
docType: rule
name: unrecognized-char-ref
summary: Disallow unrecognized character references
---

# Disallow unrecognized character references (`unrecognized-char-ref`)

HTML5 defines a set of [named character references][charref] (sometimes called HTML entities) which can be used as `&name;` where `name` is the entity name, e.g. `&apos;` (`'`) or `&amp;` (`&`).
Only entities from the list can be used.
Each entity is case sensitive but some entities is defined in multiple casing variants, e.g. both `&copy;` and `&COPY;` are acceptable.

This rule ignores numerical entities such as `&#8212;` or `&#x2014;`.

[charref]: https://dev.w3.org/html5/html-author/charref

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="unrecognized-char-ref">
    <p>&foobar;</p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="unrecognized-char-ref">
    <p>&amp;</p>
</validate>


## Version history

- %version% - Rule is made case sensitive.
