---
docType: rule
name: heading-level
category: document
summary: Require headings to start at h1 and increment by one
---

# Require headings to start at h1 and increment by one (`heading-level`)

Validates heading level increments and order. Headings must start at `h1` and
can only increase one level at a time.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="heading-level">
    <h1>Heading 1</h1>
    <h3>Subheading</h3>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="heading-level">
    <h1>Heading 1</h1>
    <h2>Subheading</h2>
</validate>

## Options

This rule takes an optional object:

```json
{
  "allowMultipleH1": false,
  "sectioningRoots": ["dialog", "[role=\"dialog\"]"]
}
```

### `allowMultipleH1`

Set `allowMultipleH1` to `true` to allow multiple `<h1>` elements in a document.

### `sectioningRoots`

List of selectors for elements starting new sectioning roots, that is elements with their own outlines.
When a new sectioning root is found the heading level may restart at `<h1>`.
The previous heading level will be restored after the sectioning root is closed by a matching end tag.

Note that the default value does not include all elements considered by HTML5 to be [sectioning roots][html5-sectioning-root] because browsers and tools does not yet implement outline algorithms specified in the standard.

With this option the following is considered valid:

<validate name="sectioning-root" rules="heading-level">
    <h1>Heading 1</h1>
    <h2>Subheading 2</h2>
    <dialog>
        <!-- new sectioning root, heading level can restart at h1 -->
        <h1>Dialog header</h1>
    </dialog>
    <!-- after dialog the level is restored -->
    <h3>Subheading 3</h2>
</validate>

[html5-sectioning-root]: https://html.spec.whatwg.org/multipage/sections.html#sectioning-root
