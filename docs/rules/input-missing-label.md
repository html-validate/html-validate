---
docType: rule
name: input-missing-label
category: a17y
summary: Require input to have label
---

# Require input elements to have a label (`input-missing-label`)

All input elements must have an associated label.

It is required for accessibility tools to identify the purpose of the field.

For browsers it helps the user when clicking on the label to focus the field, especially important for checkboxes and radiobuttons where many users expect to be able to click in the label.

The label may either be explicitly associated using the `for` attribute or by nesting the `<input>` element inside the `<label>`.
For regular input fields the former is recommended and for checkboxes and radiobuttons the latter is recommended.

This rule ignores:

- `<input type="hidden">`
- `<input type="submit">` - but you should ensure `value` contains non-empty text.
- `<input type="button">` - but you should ensure `value` contains non-empty text.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="input-missing-label">
    <!-- no label element at all -->
    <div>
        <strong>My field</strong>
        <input type="text">
        <textarea></textarea>
        <select>
            <option>Option</option>
        </select>
    </div>

    <!-- unassociated label -->
    <div>
        <label>My field</label>
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

This rule requires labels to be accessible, i.e. the label must not be `hidden` or `aria-hidden`.
If multiple labels are associated at least one of them must be accessible.

<validate name="hidden" rules="input-missing-label">
	<label for="my-input" aria-hidden="true">My field</label>
	<input id="my-input" type="text">
</validate>
