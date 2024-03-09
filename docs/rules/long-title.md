---
docType: rule
name: long-title
category: seo
summary: Require title not to have too long text
---

# Require title not to have too long text

Search engines truncates titles with too long text, typically only displaying
the first 60-70 characters. Possibly down-ranking the page in the process as it
raises the suspicion of keyword stuffing.

See [MDN recommendation][mdn] and [WCAG G88: Providing descriptive
titles][wcag-g88].

[mdn]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title#Page_titles_and_SEO
[wcag-g88]: https://www.w3.org/WAI/WCAG21/Techniques/general/G88

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="long-title">
    <head>
        <title>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</title>
    </head>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="long-title">
    <head>
        <title>Lorem ipsum</title>
    </head>
</validate>

## Options

This rule takes an optional object:

```json
{
  "maxlength": 120
}
```

### `maxlength`

Set a custom max length (inclusive).
