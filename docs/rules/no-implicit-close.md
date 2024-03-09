---
docType: rule
name: no-implicit-close
category: style
summary: Require elements with optional end tags to be explicitly closed
standards:
  - html5
---

# Require elements with optional end tags to be explicitly closed

Some elements in HTML has optional end tags. When an optional tag is omitted a
browser must handle it as if the end tag was present.

Omitted end tags can be ambiguous for humans to read and many editors have
trouble formatting the markup.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="parent" rules="no-implicit-close">
    <ul>
        <li>foo
        <li>bar
        <li>baz
    </ul>
</validate>

<validate name="siblings" rules="no-implicit-close">
    <p>lorem ipsum
    <p>dolor sit amet
</validate>

<validate name="adjacent" rules="no-implicit-close">
    <p>
        <div>lorem ipsum</div>
    </p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct-list" rules="no-implicit-close">
    <ul>
         <li>foo</li>
         <li>bar</li>
         <li>baz</li>
    </ul>
</validate>

<validate name="correct-paragraph" rules="no-implicit-close">
    <p>lorem ipsum</p>
    <p>dolor sit amet</p>
</validate>
