---
docType: rule
name: map-dup-name
summary: Require `<map name>` to be unique
---

# Require `<map name>` to be unique (`map-dup-name`)

In HTML5 `<map name>` to be a unique name.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="map-dup-name">
    <map name="foo"></map>
    <map name="foo"></map>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="map-dup-name">
    <map name="foo"></map>
    <map name="bar"></map>
</validate>

## Version history

- 7.9.0 - Rule added.
