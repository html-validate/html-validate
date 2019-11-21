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
  foreign: boolean;
  void: boolean;
  transparent: boolean;
  scriptSupporting: boolean;
  form: boolean;

  /* attributes */
  deprecatedAttributes: string[];
  requiredAttributes: string[];
  attributes: PermittedAttribute;

  /* permitted data */
  permittedContent: Permitted;
  permittedDescendants: Permitted;
  permittedOrder: PermittedOrder;
  requiredAncestors: string[];
  requiredContent: string[];

  /* inheritance */
  inherit?: string;
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

### `foreign`

If true the element is [foreign][whatwg-foreign] and will only be parsed for
valid tokens. The DOM tree will only contain the foreign element itself but none
of the children. Unless used in an illegal context no rules will trigger on the
element or its child nodes.

Examples of foreign elements includes `<svg>` and `<math>`. While technically
XML it has its own set of rules (e.g. SVG uses camelcase attribute which
triggers the [attr-case](/rules/attr-case.html) rule).

[whatwg-foreign]: https://html.spec.whatwg.org/multipage/syntax.html#foreign-elements

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

### `scriptSupporting`

Elements whose primary purpose is to support scripting should set this flag to `true`.
Some elements will generally only allow a very narrow set of children (such as `<ul>` only allowing `<li>`) but usually also allows [script-supporting elements][whatwg-scriptsupporting].

In HTML5 both the `<script>` and `<template>` tags are considered script-supporting but javascript frameworks and web-components may include additional tags.

[whatwg-scriptsupporting]: https://html.spec.whatwg.org/multipage/dom.html#script-supporting-elements-2

### `form`

Elements which are considered to be a form-element should set this flag to `true`.
In plain HTML only the `<form>` element is considered a form but when using custom components the form element might be wrapped inside and to make rules related to forms pick up the custom element this flag should be set.

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
- Boolean attributes must be set to an empty list `[]`:  
  `"my-attr": []`

Regular expressions can also be used, e.g `"/-?\\d+/"` to match numbers.

This is used by the
[attribute-allowed-values](/rules/attribute-allowed-values.html) rule.

### `requiredAttributes`

A list of required attributes the element must have.

```js
"custom-element": {
  "requiredAttributes": [
    "foo"
  ]
}
```

Given the above metadata the attribute `"foo"` must be present on the element
`<custom-element>`.

This is used by the
[element-required-attributes](/rules/element-required-attributes.html) rule.

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

### `requiredAncestors`

Requires a specific sequence of ancestors.

Some elements has additional restrictions on parent elements, for instance an
`<area>` element must have a `<map>` element as ancestor but not neccesarily as
a direct parent.

`requiredAncestors` is a list of selectors for which at least one must be true
for the ancestors. The selector may include the element being checked as the
final part of the selector.

```js
"dt": {
  "requiredAncestors": [
    "dl > dt",
    "dl > div > dt"
  ]
}
```

This will require `<dt>` elements to either be a direct descendant to `<dl>` or
with a single `<div>` element between. In both cases a `<dl>` element must be
present.

This is used by
[element-permitted-content](/rules/element-permitted-content.html) rule.

### `requiredContent`

Requires certain content in an element.

Some elements has requirements of what content must be present. For instance,
the `<head>` element requires a `<title>` element.

`requiredContent` is a list of tagnames which must be present as a direct
descentant of the element.

```js
"head": {
  "requiredContent": [
    "title"
  ]
}
```

This is used by [element-required-content](/rules/element-required-content.html)
rule.

## Global element

The special `*` element can be used to assign global metadata applying to all
elements, e.g. global attributes.

```js
"*": {
  "attributes": {
    "tabindex": ["/-?\\d+/"]
  ]
}
```

## Inheritance

Elements can inherit from other elements using the `inherits` property.
When inheriting all properties will be duplicated to the new element.
Any new property set on the element will override the parent element.

Given the following metadata:

```js
"foo": {
  "flow": true,
  "transparent": true
},
"bar": {
  "inherit": "foo",
  "transparent": false
}
```

The final `<bar>` metadata will be merged to:

```js
"bar": {
  "flow": true,
  "transparent": false
}
```

Elements being inherited must be defined before the inheritor or an error will be thrown.
