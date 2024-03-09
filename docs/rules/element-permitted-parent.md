---
docType: rule
name: element-permitted-parent
category: content-model
summary: Validate permitted element parent
standards:
  - html5
---

# Validate permitted element parent

Some elements have restrictions for what parent element they can have.
For instance, the parent of `<body>` element must the `<html>` element.

This rule does not validate the document root element, e.g. while the `<body>` element can only have `<html>` as parent if there is no parent at all it is assumed to be valid usage.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-permitted-parent">
    <div>
        <title>Lorem ipsum</title>
    </div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-permitted-parent">
    <head>
        <title>Lorem ipsum</title>
    </head>
</validate>

## Version history

- 7.4.0 - Rule added.
