---
docType: rule
name: hidden-focusable
category: a11y
summary: Disallows `aria-hidden` on focusable elements
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Disallows `aria-hidden` on focusable elements

When focusable elements are hidden with `aria-hidden` they are still reachable using conventional means such as a mouse or keyboard but won't be exposed to assistive technology (AT).
This is often confusing for users of AT such as screenreaders.

This applies to the element itself and any ancestors as `aria-hidden` applies to all child elements.

To fix this either:

- Remove `aria-hidden`.
- Remove the element from the DOM instead.
- Use the `hidden` attribute or similar means to hide the element.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="hidden-focusable">
	<a href="#" aria-hidden="true">
		lorem ipsum
	</a>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="hidden-focusable">
	<a href="#">
		lorem ipsum
	</a>
</validate>

## Version history

- 8.9.0 - Rule added
