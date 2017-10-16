# verify element content model (`element-permitted-order`)

Some elements has a specific order the children must use.

## Rule details

Examples of **incorrect** code for this rule:

```html
<!-- table caption must be used before thead -->
<table>
	<thead></thead>
	<caption></caption>
</div>
```

Examples of **correct** code for this rule:

```html
<table>
	<caption></caption>
	<thead></thead>
</table>
```
