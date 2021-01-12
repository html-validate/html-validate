---
docType: rule
name: heading-level
category: document
summary: Require headings to start at h1 and be sequential
---

# heading level (`heading-level`)

Validates heading level increments and order. Headings must start at `h1` and
can only increase one level at a time.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="heading-level">
    <h1>Heading 1</h1>
    <h3>Subheading</h3>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="heading-level">
    <h1>Heading 1</h1>
    <h2>Subheading</h2>
</validate>

## Options

This rule takes an optional object:

```json
{
  "allowMultipleH1": false
}
```

### AllowMultipleH1

Set `allowMultipleH1` to `true` to allow multiple `<h1>` elements in a document.
