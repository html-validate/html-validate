# verify element content model (`element-permitted-occurrences`)

Some elements may only be used a fixed amount of times in given context.

## Rule details

Examples of **incorrect** code for this rule:

```html
<!-- table footer can only be used once -->
<table>
	<tfoot></tfoot>
	<tfoot></tfoot>
</div>
```

Examples of **correct** code for this rule:

```html
<table>
	<tfoot></tfoot>
</table>
```
