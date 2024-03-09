---
docType: rule
name: void-style
category: style
summary: Require a specific style for closing void elements
---

# Require a specific style for closing void elements

HTML [void elements](https://www.w3.org/TR/html5/syntax.html#void-elements) are elements which cannot have content.
Void elements are implicitly closed (`<img>`) but may optionally be XML-style self-closed (`<img/>`).

This rules enforces usage of one of the two styles.
Default is to omit self-closing tag.

This rule has no effect on non-void elements, see the related rule {@link no-self-closing}.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="void-style">
    <input/>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="void-style">
    <input>
</validate>

## Options

This rule takes an optional object:

```json
{
  "style": "omit"
}
```

### Style

- `omit` requires end tag to be omitted and disallows self-closing
  elements (default).
- `selfclosing` requests self-closing all void element.
