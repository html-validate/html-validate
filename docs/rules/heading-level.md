---
docType: rule
name: heading-level
category: document
summary: Require headings to start at h1 and increment by one
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Require headings to start at h1 and increment by one

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
  "minInitialRank": "h1",
  "sectioningRoots": ["dialog", "[role=\"dialog\"]", "[role=\"alertdialog\"]"]
}
```

### `allowMultipleH1`

Set `allowMultipleH1` to `true` to allow multiple `<h1>` elements in a document.

### `minInitialRank`

- type: `"h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "any" | false`
- default: `"h1"`

Sets the allowed initial heading levels (inclusive).
By setting this to `h2` the document may start at `<h2>` and later being followed by `<h1>`:

<validate name="min-initial-rank" rules="heading-level" heading-level='{"minInitialRank": "h2"}'>
    <nav>
        <h2>Navigation</h2>
    </nav>
    <h1>Heading 1</h1>
</validate>

Setting this to `"any"` or `false` is equivalent to `"h6"`, i.e. effectively disabling the check for the initial heading level as all possible levels are now allowed.

Note: this does not affect sectioning roots.
Each sectioning root can either continue of the current level or restart at `<h1>`.

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

## Version history

- 7.14.0 - `[role="alertdialog"]` added as default sectioning root.
- 5.5.0 - `minInitialRank` option added.
