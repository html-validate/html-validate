---
docType: rule
name: tel-non-breaking
category: a11y
summary: Require non-breaking characters in telephone numbers
---

# Require non-breaking characters in telephone numbers

When telephone numbers are written out they are expected to be all on one line with no line breaks.
If line break are added it gets harder to read and comprehend.
Line breaks are typically added if the text is placed near the end of a line and the containing element gets too small.

Consider the following two:

- `+4670 174 06 35`
- <code>+4670 174<br>06 35</code>

When written on a single line it is quickly recognizable and readable but when the line break is inserted the natural flow is broken and is not as easy to read.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="tel-non-breaking">
    <a href="tel:555123456">
        <span>555-123 456</span>
    </a>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="tel-non-breaking">
    <a href="tel:555123456">
        <span>555&#8209;123&nbsp;456</span>
    </a>
</validate>

## Options

This rule takes an optional object:

```json
{
  "characters": [
    { "pattern": " ", "replacement": "&nbsp;", "description": "non-breaking space" },
    { "pattern": "-", "replacement": "&#8209;", "description": "non-breaking hyphen" }
  ],
  "ignoreClasses": [],
  "ignoreStyle": true
}
```

### `characters`

List of disallowed characters and their replacements.

### `ignoreClasses`

If the `<a>` element has one of the listed classes it is ignored by this rule.
Use when applying styling to prevent line breaks.

For instance, when configured with `["nobreak"]` the following is valid:

<validate name="ignored" rules="tel-non-breaking" tel-non-breaking='{"ignoreClasses": ["nobreak"]}'>
    <a class="nobreak" href="tel:555123456">
        <span>555-123 456</span>
    </a>
</validate>

### `ignoreStyle`

When set to `true` the `<a>` element is checked for inline styling forcing it to preserve whitespace and prevent line breaks.

Currently the following styles is checked:

- `white-space: nowrap`
- `white-space: pre`

With this option the following is valid:

<validate name="ignore-style" rules="tel-non-breaking">
    <a style="white-space: nowrap" href="tel:555123456">
        555-123 456
    </a>
</validate>

## Version history

- 6.8.0 - `ignoreStyle` added
- 6.7.0 - Rule added
