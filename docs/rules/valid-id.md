---
docType: rule
name: valid-id
category: syntax
summary: Require `id` to be a valid identifier
standards:
  - html5
---

# Valid ID

Requires the `id` attribute to be a valid identifier.

Strictly the HTML5 standard defines valid IDs as non-empty and without any whitespace but many other characters can be troublesome when used to create selectors as they require intricate escaping (e.g. `id="123"` becomes `#\\31 23`).

By default, this rule enforces that ID begins with a letter and that only letters, numbers, underscores and dashes are used but this can be disabled with the "relaxed" option to only validate the strict definition from the standard.

See also the related {@link rules/id-pattern} rule which can be used for applying a consistent style to the codebase (by for instance requiring only dashes instead of underscores as separators)

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="valid-id">
    <p id=""></p>
    <p id="foo bar"></p>
    <p id="123"></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="valid-id">
    <p id="foo-123"></p>
</validate>

## Options

This rule takes an optional object:

```json
{
  "relaxed": false
}
```

### `relaxed`

When set to `true` this rule only validates the ID is non-empty and contains no whitespace.

<validate name="relaxed" rules="valid-id" valid-id='{"relaxed": true}'>
    <p id="123"></p>
    <p id="#foo[bar]"></p>
</validate>

## Version history

- %version% - Handles unicode letters.
