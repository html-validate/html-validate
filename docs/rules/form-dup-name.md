---
docType: rule
name: form-dup-name
category: syntax
summary: Require form controls to have a unique name
---

# Require form controls to have a unique name

While not strictly required by the HTML standard using the same name on multiple form controls can be confusing to read and is often an oversight by the developer.
Submitting form with duplicate names are converted to arrays and some javascript frameworks assume the name is unique when serializing form data.

The form control name also plays a role in the autocomplete heurestics so using good names is important to get accurate results.

By default, radiobuttons (`<input type="radio">`) is generally ignored by this rule as they are typically using the same name on purpose but they cannot share the same name as other controls.

Each `<form>` and `<template>` element tracks the names separately, i.e. you can have two forms with colliding names.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="form-dup-name">
    <form>
        <input name="foo">
        <input name="foo">
    </form>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="form-dup-name">
    <form>
        <input name="foo">
        <input name="bar">
    </form>
</validate>

## Radiobuttons

By default, radiobuttons may share the same name:

<validate name="correct-radio-checkbox" rules="form-dup-name">
    <form>
        <input name="foo" type="radio">
        <input name="foo" type="radio">
    </form>
</validate>

They cannot share the same name as other controls:

<validate name="incorrect-radio" rules="form-dup-name">
    <form>
        <input name="foo" type="text">
        <input name="foo" type="radio">
    </form>
</validate>

See the [`shared`](#shared) option to add this behaviour for other controls.

## Options

This rule takes an optional object:

```json
{
  "allowArrayBrackets": true,
  "shared": ["radio"]
}
```

### `allowArrayBrackets`

- type: `boolean`
- default: `true`

Form control names ending with `[]` is typically used to signify arrays.
With this option names ending with `[]` may be shared between controls.

With this option **disabled** the following is **incorrect**:

<validate name="array-incorrect" rules="form-dup-name" form-dup-name='{"allowArrayBrackets": false}'>
    <form>
        <input name="foo[]">
        <input name="foo[]">
    </form>
</validate>

With this option **enabled** the following is **correct**:

<validate name="array-correct" rules="form-dup-name">
    <form>
        <input name="foo[]">
        <input name="foo[]">
    </form>
</validate>

### `shared`

- type: `Array<"radio" | "checkbox" | "submit" | "button" | "reset">`
- default: `["radio", "submit", "button", "reset"]`

By default only `<input type="radio">` can have a shared common name.
This options lets you specify additional controls that may have a shared common name.

- `"radio"` - applies to `<input type="radio">`.
- `"checkbox"` - applies to `<input type="checkbox">`.
- `"submit"` - applies to `<button type="submit">` and `<input type="submit">`.
- `"button"` - applies to `<button type="button">` and `<input type="button">`.
- `"reset"` - applies to `<button type="reset">` and `<input type="reset">`.

With this option set to `["radio"]` the following is **incorrect**:

<validate name="shared-incorrect" rules="form-dup-name" form-dup-name='{"shared": ["radio"]}'>
    <form>
        <input name="foo" type="checkbox">
        <input name="foo" type="checkbox">
    </form>
</validate>

With this option set to `["radio", "checkbox"]` the following is **correct**:

<validate name="shared-correct" rules="form-dup-name" form-dup-name='{"shared": ["radio", "checkbox"]}'>
    <form>
        <input name="foo" type="checkbox">
        <input name="foo" type="checkbox">
    </form>
</validate>

The name cannot be shared between different types of controls:

<validate name="shared-mix" rules="form-dup-name" form-dup-name='{"shared": ["radio", "checkbox"]}'>
    <form>
        <input name="foo" type="checkbox">
        <input name="foo" type="radio">
    </form>
</validate>

## Metadata

This rule check all elements marked as `formAssociated` with the `listed` property.

To use with custom elements set the `listed` property to `true`:

```ts
const { defineMetadata } = require("html-validate");

module.exports = defineMetadata({
  "custom-element": {
    formAssociated: {
      listed: true,
    },
  },
});
```

## Version history

- %version% - Track `<template>` elements separately.
- 7.15.2 - `<button type="submit">` included as `shared` by default.
- 7.12.2 - `allowArrayBrackets` and `shared` options added.
- 7.12.0 - Rule added.
