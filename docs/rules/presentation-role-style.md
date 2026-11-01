---
docType: rule
name: presentation-role-style
category: style
summary: Require a consistent role for presentational elements
---

# Require a consistent role for presentational elements

ARIA 1.1 introduces the role `none` as a synonym for the `presentation` role.
Many authors confused `role="presentation"` with `aria-hidden="true"`, and `role="none"` conveys the intended meaning more clearly.

This rule requires one of the two synonyms to be used consistently.
By default `role="none"` is preferred.

::: warning Compatibility

`role="none"` was introduced in ARIA 1.1 and very old browsers such as Internet Explorer does not support it.
If you target ARIA 1.0 or need to support very old browsers, configure this rule to prefer `role="presentation"`.

:::

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="presentation-role-style"
<img role="presentation" />
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="presentation-role-style"
<img role="none" />
```

## Options

This rule takes an optional object:

```json
{
  "prefer": "none"
}
```

### `prefer`

- type: `"none" | "presentation"`
- default: `"none"`

Sets the prefered role to use.

## See also

- [WAI-ARIA none role](https://www.w3.org/TR/wai-aria-1.2/#none)
- [Hiding Semantics with the presentation Role](https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/)

## Version history

- %version% - Rule added.
