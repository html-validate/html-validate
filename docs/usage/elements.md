@ngdoc content
@module usage
@name Elements metadata
@description

# Elements metadata

For proper validation each element must have a corresponding metadata entry. If
no metadata is present many rules will just ignore the element entirely. To
configure metadata sources use `elements: [...]`, see
[configuring](/usage).

A typical custom element may look like:

```js
"custom-element": {
  "flow": true
}
```

Each entry can contain the following properties:

```typescript
export interface MetaElement {
	/* content categories */
	metadata: boolean | PropertyExpression;
	flow: boolean | PropertyExpression;
	sectioning: boolean | PropertyExpression;
	heading: boolean | PropertyExpression;
	phrasing: boolean | PropertyExpression;
	embedded: boolean | PropertyExpression;
	interactive: boolean | PropertyExpression;

	/* element properties */
	deprecated: boolean | string;
	void: boolean;
	transparent: boolean;

	/* permitted data */
	attributes: PermittedAttribute;
	deprecatedAttributes: string[];
	permittedContent: Permitted;
	permittedDescendants: Permitted;
	permittedOrder: PermittedOrder;
}
```

## Content categories

Each content model property defines what type of element it is. See [MDN][1] and
[W3C][2] for description of the different categories.

For custom elements this should be set to `flow` or `phrasing` depending on the
context it should be allowed in. Essentially `flow` would equal a `div` or
`display: block` while `phrasing` would equal a `span` or `display: inline`
(which is default CSS for unknown elements).

[1]: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
[2]: https://www.w3.org/TR/html5/dom.html#kinds-of-content

Each property should either be a boolean (defaults to `false`) or a property
expression in the form `string | [string, any]`.

### Property expressions

Property expressions take the form `string | [string, any]` where the string is
the name of the evaluator which may take optional data passed as the second
argument.

Some elements depend on the context in which they are used. For instance the audio element
is interactive content if it has the `controls` attribute:

```js
"audio": {
  "interactive": ["hasAttribute", "controls"]
}
```

The available evaluators are:

- `isDescendant` evaluates to `true` if the element is a descendant of the
  element provided as argument.  
  `["isDescendant", "map"]`
- `hasAttribute` evaluates to `true` if the element has the specified attribute.  
  `["hasAttribute", "usemap"]`
- `matchAttribute` tests if specified attribute against a value.  
  `["matchAttribute", ["type", "!=", "hidden"]]`

## Element properties

### `deprecated`

If true the element will trigger the [deprecated](/rules/deprecated.html) rule
when used. Can optionally be set to a string which will be displayed as well.

### `void`

If the element is void (self-closing) this should be set to true. This is
normally not the case for custom elements as they are required to have a close
tag.

### `transparent`

Some elements are transparent which means that in addition to itself each of the
children must also be valid content, just as if this element wasn't used.

A typical example would be the `<a>` element, when it is used as a child of a
`<div>` element (flow) it allows content which is also flow, but if it is used
as a child of a `<span>` element (phrasing) it only allows new phrasing content.

For custom elements it can be useful to set this if the content category isn't
flow.

## Permitted content

### `attributes`

An object with allowed attribute values.

```js
"custom-element": {
  "attributes": {
    "foo": [
      "bar",
      "baz"
    ]
  }
}
```

With this metadata the attribute `"foo"` may only have the values `"bar"` or
`"foo"`.

- To allow empty values explicitly list `""`:  
  `"my-attr": ["", "value 1", "value 2"]`

### `deprecatedAttributes`

A list of attributes which is no longer allowed (deprecated) for this element.

```js
"custom-element": {
  "deprecatedAttributes": [
    "old-attribute",
    "another-attribute"
  ]
}
```

This is used by the [no-deprecated-attr](/rules/no-deprecated-attr.html) rule.

### `permittedContent`

A list of allowed children (for descendants see `permittedDescendants`) which is
allowed. Can be either a tagname or a content category:

- `"@meta"`
- `"@flow"`
- `"@sectioning"`
- `"@heading"`
- `"@phrasing"`
- `"@embedded"`
- `"@interactive"`

```js
"custom-elements": {
  "permittedContent": [
    "transclude-slot-1",
    "transclude-slot-2"
  ]
}
```

This is used by
[element-permitted-content](/rules/element-permitted-content.html) rule.

#### Excluding

This is normally a whitelist of elements but can be switched to a blacklist by
using `exclude`:

```js
"custom-elements": {
  "permittedContent": [
    {"exclude": "@interactive"}
  ]
}
```

#### Limit occurrences

If a child is only allowed once it can be suffixed with `?` to limit to 0 or 1
number of occurrences.

```js
"table": {
  "permittedContent": [
    "caption?"
  ]
}
```

This will disallow `<caption>` from being used more than once under `<table>`.

This is used by
[element-permitted-occurrences](/rules/element-permitted-occurrences.html) rule.

### `permittedDescendants`

Same as `permittedContent` but checks all descendants and not just intermediate
children. Both can be used together, e.g `<article>` is defined as:


```js
"article": {
  "permittedContent": [
    "@flow"
  ],
  "permittedDescendants": [
    {"exclude": ["main"]}
  ]
}
```

Thus is allows any flow content but disallows `<main>` as a descendant.

This is used by
[element-permitted-content](/rules/element-permitted-content.html) rule.

### `permittedOrder`

Requires children to be used in a specific order.

Elements listed has to occur in the same order as specified, elements which is
not specified can appear anywhere.

```js
"table": {
  "permittedOrder": [
    "thead",
    "tbody",
    "tfoot",
  ]
}
```

This will require `<thead>` to come before `<tbody>` but will let `<script>`
appear anywhere.

This is used by
[element-permitted-order](/rules/element-permitted-order.html) rule.
