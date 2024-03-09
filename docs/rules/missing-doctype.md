---
docType: rule
name: missing-doctype
category: document
summary: Require document to have a doctype
standards:
  - html5
---

# Require a doctype for the document

Requires that the document contains a doctype.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="missing-doctype">
    <html>
        <body>...</body>
    </html>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="missing-doctype">
    <!doctype html>
    <html>
        <body>...</body>
    </html>
</validate>
