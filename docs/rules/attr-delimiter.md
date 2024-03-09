---
docType: rule
name: attr-delimiter
category: syntax
summary: Disallow whitespace between attribute key and value
standards:
  - html5
---

# Disallow whitespace between attribute key and value

While technically allowed by the HTML5 specification this rule disallows the usage of whitespace separating the attribute key and value, i.e. before or after the `=` character.

Usage of whitespace in this context is typically a sign of typo or unintended behaviour.
For instance, consider the following markup:

<!-- prettier-ignore -->
```html
<input name= disabled>
```

As the HTML5 specification allows whitespace after `=` this is to be interpreted as `<input name="disabled">` which is has a completely different meaning than the developer probably intended.
This could have been generated from a templating langage where the value supposted to be bound to `name` was not set:

<!-- prettier-ignore -->
```html
<input name=<%= fieldName %> disabled>
```

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attr-delimiter">
    <input name= "my-field">
    <input name ="my-field">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attr-delimiter">
    <input name="my-field">
</validate>
