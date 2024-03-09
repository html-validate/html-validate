---
docType: rule
name: no-style-tag
category: style
summary: Disallow usage of <style> tag
---

# Disallow usage of `<style>` tag

The `<style>` tag can be used to write CSS directly inside the document. When
using multiple documents it is preferable to put all styling in a single asset
and use the `<link>` tag to reference it to lower the bandwidth required (by
preventing duplicated style across all page loads).

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-style-tag">
    <style>
        body {
            background-color: hotpink;
        }
    </style>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-style-tag">
    <link rel="stylesheet" src="my-style.css">
</validate>
