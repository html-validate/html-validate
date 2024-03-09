---
docType: rule
name: map-id-name
category: syntax
summary: Require name and id to match on <map> elements
standards:
  - html5
---

# Require name and id to match on `<map>` elements

HTML5 requires that when the `id` attribute is present on a `<map>` element it must have the same value as the required `name` attribute.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="map-id-name">
    <map name="foo" id="bar"></map>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="map-id-name">
    <map name="foo" id="foo"></map>
</validate>

## Version history

- 7.12.0 - Rule added.
