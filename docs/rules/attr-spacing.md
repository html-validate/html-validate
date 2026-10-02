---
docType: rule
name: attr-spacing
category: syntax
summary: Require attributes to be separated by whitespace
standards:
  - html5
---

# Require attributes to be separated by whitespace

In HTML attributes must be separated by whitespace (commonly a regular space).

## Rule details

Examples of **incorrect** code for this rule:

<!-- prettier-ignore -->
```html validate name="incorrect" rules="attr-spacing"
<input type="submit"class="foo" />
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="attr-spacing"
<input type="submit" class="foo" />
```
