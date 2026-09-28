---
docType: rule
name: element-permitted-order
category: content-model
summary: Validate required element order
standards:
  - html5
---

# Validate required element order

Some elements has a specific order the children must use.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="element-permitted-order"
<!-- table caption must be used before thead -->
<table>
  <thead></thead>
  <caption></caption>
</div>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="element-permitted-order"
<table>
  <caption></caption>
  <thead></thead>
</table>
```
