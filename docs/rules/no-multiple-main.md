---
docType: rule
name: no-multiple-main
category: content-model
summary: Disallow multiple `<main>`
standards:
  - html5
---

# Disallows multiple `<main>` elements in the same document

HTML5 [disallows][whatwg] multiple visible `<main>` element in the same document.
Multiple `<main>` can be present but at most one can be visible and the others must be hidden using the `hidden` attribute.

[whatwg]: https://html.spec.whatwg.org/multipage/grouping-content.html#the-main-element

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-multiple-main">
	<main>foo</main>
	<main>bar</main>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-multiple-main">
	<main>foo</main>
	<main hidden>bar</main>
</validate>
