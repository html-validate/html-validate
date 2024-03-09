---
docType: rule
name: prefer-button
category: style
summary: Prefer to use <button> instead of <input> for buttons
---

# Prefer to use `<button>` instead of `<input>` for buttons

HTML5 introduces the generic `<button>` element which replaces `<input type="button">` and similar constructs.

The `<button>` elements has some advantages:

- It can contain markup as content compared to the `value` attribute of `<input>` which can only hold text. Especially useful to add `<svg>` icons.
- The button text is a regular text node, no need to quote characters in the `value` attribute.
- Styling is easier, compare the selector `button` to `input[type="submit"], input[type="button"], ...`.

This rule will target the following input types:

- `<input type="button">`
- `<input type="submit">`
- `<input type="reset">`
- `<input type="image">`

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="prefer-button">
	<input type="button">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="prefer-button">
	<button type="button"></button>
</validate>

## Options

This rule takes an optional object:

```json
{
  "include": [],
  "exclude": []
}
```

### `include`

If set only types listed in this array generates errors.

### `exclude`

If set types listed in this array is ignored.
