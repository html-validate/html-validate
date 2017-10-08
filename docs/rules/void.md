# disallows void element with content (`void`)

HTML [void elements](https://www.w3.org/TR/html5/syntax.html#void-elements)
cannot have any content and must not have an end tag.

## Rule details

Examples of **incorrect** code for this rule:

```html
<fieldset>
	<input></input>
</fieldset>

<div>
	<img></img>
</div>
```

Examples of **correct** code for this rule:

```html
<fieldset>
	<!-- End tag should be omitted -->
	<input>
</fieldset>

<div>
	<!-- XHTML style self-closed element is allowed -->
	<img/>
</div>
```
