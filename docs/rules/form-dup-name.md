---
docType: rule
name: form-dup-name
summary: Require form controls to have unique name
---

# Require form controls to have unique name (`form-dup-name`)

While not strictly required by the HTML standard using the same name on multiple form controls can be confusing to read and is often an oversight by the developer.
Submitting form with duplicate names are converted to arrays and some javascript frameworks assume the name is unique when serializing form data.

The form control name also plays a role in the autocomplete heurestics so using good names is important to get accurate results.

Radiobuttons (`<input type="radio">`) and checkboxes (`<input type="checkbox">`) are generally ignored by this rule as they are typically using the same name on purpose but they cannot share the same name as other controls.

Each `<form>` tracks the names separately, i.e. you can have two forms with colliding names.

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

## Radiobuttons and checkboxes

Groups of radiobuttons or checkboxes may share the same name:

<validate name="correct-radio-checkbox" rules="form-dup-name">
    <form>
        <input name="foo" type="radio">
        <input name="foo" type="radio">

        <input name="bar" type="checkbox">
        <input name="bar" type="checkbox">
    </form>

</validate>

They cannot share the same name as other controls:

<validate name="incorrect-radio" rules="form-dup-name">
    <form>
        <input name="foo" type="text">
        <input name="foo" type="radio">
    </form>
</validate>

The name cannot be shared between different types of groups:

<validate name="incorrect-shared" rules="form-dup-name">
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

- 7.12.0 - Rule added.
