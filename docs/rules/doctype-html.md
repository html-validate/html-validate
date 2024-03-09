---
docType: rule
name: doctype-html
category: document
summary: Require usage of "html" doctype
standards:
  - html5
---

# Require usage of "html" doctype

HTML5 requires the usage of the `<!DOCTYPE html>` doctype to prevent browsers
from guessing and/or using "quirks mode".

HTML5 also supports legacy strings for document generators but this rule
disallows legacy strings as well.

This rule only validates the doctype itself not the presence of the
declaration. Use [missing-doctype](missing-doctype.html) to validate presence.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="doctype-html">
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
</validate>

<validate name="legacy" rules="doctype-html">
    <!DOCTYPE html SYSTEM "about:legacy-compat">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="doctype-html">
    <!DOCTYPE html>
</validate>
