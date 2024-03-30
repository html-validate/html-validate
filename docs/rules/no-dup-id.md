---
docType: rule
name: no-dup-id
category: document
summary: Disallow duplicated IDs
standards:
  - html5
---

# Disallows elements with duplicated ID

The ID of an element [must be unique](https://www.w3.org/TR/html5/dom.html#the-id-attribute) within the document.
When `<template>` is used the `id` within the template must be unique but can otherwise contain duplicates as it isn't attached to the document yet.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-dup-id">
    <div id="foo"></div>
    <div id="foo"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-dup-id">
    <div id="foo"></div>
    <div id="bar"></div>
</validate>
