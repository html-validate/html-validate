---
docType: rule
name: input-missing-label
category: a11y
summary: Require input to have label
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Require input elements to have a label

All input elements must have an associated label or accessible name.

It is required for accessibility tools to identify the purpose of the field.

For browsers it helps the user when clicking on the label to focus the field, especially important for checkboxes and radiobuttons where many users expect to be able to click in the label.

The recommended way is using a `<label>` element either explicitly associated using the `for` attribute or by nesting the `<input>` element inside the `<label>`.
For regular input fields the former is recommended and for checkboxes and radiobuttons the latter is recommended.

An accessible name may also be provided using `aria-label` or `aria-labelledby`.
This ensures accessibility tools can pick up the label but does not ensure a visual text is present so use with caution.

This rule ignores:

- `<input type="hidden">`
- `<input type="submit">` - but you should ensure `value` contains non-empty text.
- `<input type="reset">` - but you should ensure `value` contains non-empty text.
- `<input type="button">` - but you should ensure `value` contains non-empty text.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="input-missing-label">
    <!-- no label element at all -->
    <div>
        <strong>My input field</strong>
        <input type="text">

        <textarea></textarea>

        <select>
            <option>Option</option>
        </select>
    </div>

    <!-- unassociated label -->
    <div>
        <label>My input field</label>
        <input type="text">
    </div>

</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="input-missing-label">
    <!-- label with descendant -->
    <div>
        <label>My field <input type="text"></label>
    </div>

    <!-- associated label -->
    <div>
        <label for="my-field">My field</label>
        <input id="my-field" type="text">
    </div>

</validate>

### Hidden labels

This rule requires labels to be accessible, i.e. the label must not be `hidden`, `inert`, `aria-hidden` or hidden with CSS.
If multiple labels are associated at least one of them must be accessible.

<validate name="hidden" rules="input-missing-label">
    <label for="my-input" aria-hidden="true">My field</label>
    <input id="my-input" type="text">
</validate>

### Using `aria-label` or `aria-labelledby`

A accessible name can be provided using `aria-label` or `aria-labelledby`.

If a visual indication is already provided elsewhere (such as an icon) you can use `aria-label` to convey the same information to screen readers:

<validate name="aria-label" rules="input-missing-label">
    <div>
        <input id="my-input" type="text" aria-label="My field">
        <svg><use xlink:href="#search-icon"></svg>
    </div>
</validate>

If the label is provided by another element elsewhere `aria-labelledby` can be used to reference the element:

<validate name="aria-labelledby" rules="input-missing-label">
    <h2 id="my-heading">Enter your name</h2>
    <input type="text" aria-labelledby="my-heading">
</validate>

## Version history

- %version% - Ignores `<input>` hidden by CSS and handles `inert` attribute.
- 7.6.0 - Checks for presence of non-empty accessible text not just presence of `<label>` element.
