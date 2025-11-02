---
docType: rule
name: no-implicit-button-type
category: a11y
summary: Disallow implicit button type
---

# Disallow implicit button type

When the `type` attribute is omitted it defaults to `submit`.
Submit buttons are triggered when a keyboard user presses <kbd>Enter</kbd>.

As this may or may not be inteded this rule enforces that the `type` attribute be explicitly set to one of the valid types:

- `button` - a generic button.
- `submit` - a submit button.
- `reset`- a button to reset form fields.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-implicit-button-type">
	<button>My Awesome Button</button>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-implicit-button-type">
	<button type="button">My Awesome Button</button>
</validate>

## Version history

- 10.3.0 - Rule ignores omitted `type` attribute on `<button>` when used as first child of `<select>`.
- 8.3.0 - Rule added.
