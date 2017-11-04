@ngdoc content
@module rules
@name no-implicit-close
@category style
@summary Require elements with optional end tags to be explicitly closed
@description

# requires elements to be explicitly closed (`no-implicit-closed`)

Some elements in HTML has optional end tags. When an optional tag is omitted a
browser must handle it as if the end tag was present.

Omitted end tags can be ambigious for humans to read and many editors have
trouble formatting the markup.

## Rule details

Examples of **incorrect** code for this rule:

```html
<ul>
	<li>foo
	<li>bar
	<li>baz
</ul>
```

```html
<p>lorem ipsum
<p>dolor sit amet
```

Examples of **correct** code for this rule:

```html
<ul>
	<li>foo</li>
	<li>bar</li>
	<li>baz</li>
</ul>
```

```html
<p>lorem ipsum</p>
<p>dolor sit amet</p>
```
