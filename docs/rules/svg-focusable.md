---
docType: rule
name: svg-focusable
category: a11y
summary: Require <svg> to have focusable attribute
---

# Require `<svg>` elements to have focusable attribute

Inline SVG elements in IE are focusable by default which may cause issues with tab-ordering.
For instance, if a link or button has an SVG icon inside the user would need to press tab twice to move focus to the next element as pressing tab would move focus to the `<svg>` element instead.
Edge and other browsers implements proper support for `tabindex` and are unaffected by this bug.

If support for IE is required the `focusable` attribute should explicitly be set to `true` or `false` to avoid unintended behavior.
Otherwise this rule can safely be disabled.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="svg-focusable">
	<a href="#">
		<svg></svg>
	</a>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="svg-focusable">
	<a href="#">
		<svg focusable="false"></svg>
	</a>
</validate>
