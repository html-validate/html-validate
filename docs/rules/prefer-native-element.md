---
docType: rule
name: prefer-native-element
category: a11y
summary: Prefer to use native HTML element over roles
standards:
  - html-aria
---

# Prefer to use native HTML element over roles

While WAI-ARIA describes many [roles][wai-aria-roles] which can provide semantic information about what the element represents.
Support for roles is varying and since HTML5 has many native equivalent elements it is better to use the native when possible.

[wai-aria-roles]: https://www.w3.org/TR/wai-aria-1.1/#role_definitions

Table of equivalent elements:

<!-- [html-validate-disable-block wcag/h63: marked does not generate tables with scope attribute] -->

| Role          | Element                |
| ------------- | ---------------------- |
| article       | article                |
| banner        | header                 |
| button        | button                 |
| cell          | td                     |
| checkbox      | input                  |
| complementary | aside                  |
| contentinfo   | footer                 |
| figure        | figure                 |
| form          | form                   |
| heading       | h1, h2, h3, h4, h5, h6 |
| input         | input                  |
| link          | a                      |
| list          | ul, ol                 |
| listbox       | select                 |
| listitem      | li                     |
| main          | main                   |
| navigation    | nav                    |
| progressbar   | progress               |
| radio         | input                  |
| region        | section                |
| table         | table                  |
| textbox       | textarea               |

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="prefer-native-element">
	<div role="main">
	  <p>Lorem ipsum</p>
	</div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="prefer-native-element">
	<main>
	  <p>Lorem ipsum</p>
	</main>
</validate>

## Options

This rule takes an optional object:

```jsonc
{
  "mapping": {
    /* ... */
  },
  "include": [],
  "exclude": [],
}
```

### `mapping`

Object with roles to map to native elements.
This can be used to provide a custom map with roles and their replacement.

### `include`

If set only roles listed in this array generates errors.

### `exclude`

If set roles listed in this array is ignored.
