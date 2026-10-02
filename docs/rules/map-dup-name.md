---
docType: rule
name: map-dup-name
category: syntax
summary: Require `<map name>` to be unique
standards:
  - html5
---

# Require `<map name>` to be unique

In HTML5 the `<map name>` attribute is required to be a unique name within the document.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="map-dup-name"
<map name="foo"></map>

<!-- uses same name -->
<map name="foo"></map>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="map-dup-name"
<map name="foo"></map>

<!-- uses different name -->
<map name="bar"></map>
```

## Version history

- 7.9.0 - Rule added.
