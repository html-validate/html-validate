---
docType: rule
name: no-self-closing
category: style
summary: Disallow self-closing elements
standards:
  - html5
---

# Disallow self-closing elements

Require regular end tags for elements even if the element has no content, e.g. require `<div></div>` instead of `<div/>`.

This rule has no effect on void elements, see the related rule {@link void-style}.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-self-closing">
    <div/>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-self-closing">
    <div></div>

    <!-- foreign elements are ignored -->
    <svg/>

    <!-- elements with XML namespace are ignored -->
    <xi:include/>

</validate>

## Options

This rule takes an optional object:

```json
{
  "ignoreForeign": true,
  "ignoreXML": true
}
```

### `ignoreForeign`

By default foreign elements are ignored by this rule.
By setting `ignoreForeign` to `false` foreign elements must not be self-closed either.

<validate name="foreign" rules="no-self-closing" no-self-closing='{"ignoreForeign": false}'>
    <svg/>
</validate>

### `ignoreXML`

By default elements in XML namespaces are ignored by this rule.
By setting `ignoreXML` to `false` elements in XML namespaces must not be self-closed either.

<validate name="xml" rules="no-self-closing" no-self-closing='{"ignoreXML": false}'>
    <xi:include/>
</validate>
