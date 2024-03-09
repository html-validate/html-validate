---
docType: rule
name: no-trailing-whitespace
category: style
summary: Disallow trailing whitespace
---

# Disallows trailing whitespace at the end of lines

Lines with trailing whitespace cause unnecessary diff when using version control
and usually serve no special purpose in HTML.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-trailing-whitespace">
    <p>lorem ipsum</p>  
    <p>dolor sit amet</p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-trailing-whitespace">
    <p>lorem ipsum</p>
    <p>dolor sit amet</p>
</validate>
