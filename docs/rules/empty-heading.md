---
docType: rule
name: empty-heading
category: a11y
summary: Require headings to have textual content
standards:
  - wcag-2.2-aa
  - wcag-2.1-aa
  - wcag-2.0-aa
---

# Require headings to have textual content

Assistive technology such as screen readers require textual content in
headings. The content cannot be whitespace only.

Each heading should make sense on its own and properly describe the related
section. Assistive tools may build a list of headings to help the user navigate
between headings, a feature which can be confusing when headings are empty or
non-descriptive.

See also [WCAG G130: Providing descriptive headings](https://www.w3.org/WAI/WCAG22/Techniques/general/G130).

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="empty-heading">
    <h1></h1>
    <h2><span></span></h2>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="empty-heading">
    <h1>Lorem ipsum</h1>
    <h2><span>Dolor sit amet</span></h2>
</validate>

### Whitespace

Text with only whitespace is also considered empty.

<validate name="whitespace" rules="empty-heading">
    <h1> </h1>
</validate>

### Images

Images can be used if they have alternative text:

<validate name="img-alt" rules="empty-heading">
    <h1>
        <img src="awesome-logo.png" alt="Our awesome logo!">
    </h1>
</validate>

### Hidden

Even if the heading or one of its parents are `hidden` this rule tests if the heading is empty.

<validate name="hidden-invalid" rules="empty-heading">
    <h1 hidden></h1>
    <div hidden>
        <h2></h1>
    </div>
</validate>

Non-empty headings are valid:

<validate name="hidden-valid" rules="empty-heading">
    <h1 hidden>Lorem ipsum</h1>
    <div hidden>
        <h2>dolor sit amet</h2>
    </div>
</validate>

## Version history

- 7.10.0 - Handles when heading (or a parent) is `hidden`.
- 7.6.0 - Handles `<img alt="..">` and `<svg>` with title.
