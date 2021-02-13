---
docType: rule
name: attr-spacing
summary: Require attributes to be separated by whitespace
---

# Require attributes to be separated by whitespace (`attr-spacing`)

In HTML attributes must be separated by whitespace (commonly a regular space).

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attr-spacing">
    <input type="submit"class="foo">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attr-spacing">
    <input type="submit" class="foo">
</validate>
