---
docType: rule
name: element-required-ancestor
category: content-model
summary: Validate required element ancestors
standards:
  - html5
---

# Validate required element ancestors

HTML defines requirements for required ancestors on certain elements.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="element-required-ancestor"
<area />
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="element-required-ancestor"
<map>
  <area />
</map>
```

## Version history

- 7.2.0 - Rule added.
