# require input elements to have a label (`input-missing-label`)

Labels are associated with the input element and is required for a17y.

## Rule details

Examples of **incorrect** code for this rule:

```html
<!-- no label element at all -->
<div>
	<strong>My field</strong>
	<input type="text">
</div>

<!-- unassociated label -->
<div>
	<label>My field</label>
	<input type="text">
</div>
```

Examples of **correct** code for this rule:

```html
<!-- label with descendant -->
<div>
	<label>My field <input type="text"></label>
</div>

<!-- associated label -->
<div>
	<label for="my-field">My field</label>
	<input id="my-field" type="text">
</div>
```
