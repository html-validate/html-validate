---
docType: rule
name: deprecated
summary: Disallow usage of deprecated elements
---

# Disallows usage of deprecated elements (`deprecated`)

HTML5 deprecated many old elements.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="deprecated">
    <center>...</center>
    <big>...</big>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="deprecated">
    <main>...</main>
</validate>

## Elements

When using custom elements metadata you can optionally specify a message:

```js
{
    "my-element": {
        "deprecated": "replaced with <other-element>"
    }
}
```

The message will be shown alongside the regular message:

<validate name="custom-message" rules="deprecated" elements="deprecated.json">
    <my-element>...</my-element>
</validate>
