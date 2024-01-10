---
docType: rule
name: unique-landmark
category: a11y
summary: Requires landmarks to have unique names
---

# Requires landmarks to have unique names (`unique-landmark`)

When the same type of landmark is present more than once in the same document each must be uniquely identifiable with a non-empty and unique name.
For instance, if the document has two `<nav>` elements each of them need an accessible name to be distinguished from each other.

This could be as simple as `aria-label="Primary"` and `aria-label="Secondary"` or if they have headings associated with them `aria-labelledby` can reference the heading.
The names should not include the name of the landmark as Assistive Technology (AT) typically reads out the landmark as well so `aria-label="Primary navigation"` would be read as "Primary navigation navigation".

The following elements / roles are considered landmarks:

- `aside` or `[role="complementary"]`
- `footer` or `[role="contentinfo"]`
- `form` or `[role="form"]`
- `header` or `[role="banner"]`
- `main` or `[role="main"]`
- `nav` or `[role="navigation"]`
- `section` or `[role="region"]`

Some exceptions apply:

- `<footer>` and `<header>` are not considered landmarks if they are nested under `<main>` or sectioning content.

If the landmark is only present at most once the name does not have to be set.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="unique-landmark">
	<nav>
		lorem ipsum
	</nav>
	<nav>
		dolor sit amet
	</nav>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="unique-landmark">
	<nav aria-label="Primary">
		lorem ipsum
	</nav>
	<h2 id="secondary-nav-heading">Secondary</h2>
	<nav aria-labelledby="secondary-nav-heading">
		dolor sit amet
	</nav>
</validate>

## Version history

- %version% - Exceptions for `<footer>` and `<header>` added.
- 8.9.0 - Rule added.
