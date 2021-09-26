---
docType: content
title: Elements metadata
---

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
  metadata?: boolean | PropertyExpression;
  flow?: boolean | PropertyExpression;
  sectioning?: boolean | PropertyExpression;
  heading?: boolean | PropertyExpression;
  phrasing?: boolean | PropertyExpression;
  embedded?: boolean | PropertyExpression;
  interactive?: boolean | PropertyExpression;

  /* element properties */
  deprecated?: boolean | string | DeprecatedElement;
  foreign?: boolean;
  void?: boolean;
  transparent?: boolean | string[];
  scriptSupporting?: boolean;
  form?: boolean;
  labelable?: boolean;

  /* attributes */
  attributes?: Record<string, MetaAttribute>;

  /* permitted data */
  permittedContent?: Permitted;
  permittedDescendants?: Permitted;
  permittedOrder?: PermittedOrder;
  requiredAncestors?: string[];
  requiredContent?: string[];
  textContent?: "none" | "default" | "required" | "accessible";

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

If truthy the element will trigger the [deprecated](/rules/deprecated.html) rule
when used.

Can be set to `true`, a string or an object.

```typescript
interface DeprecatedElement {
  message?: string;
  documentation?: string;
  source?: string;
}
```

Setting `true` is the same as the empty object.
Setting a string is the same as setting `message` to the string.

If the `message` property is set the text will be displayed in the error message.

If the `documentation` property is set the text will be rendered as markdown and shown in the contextual documentation shown by editors.
`$tagname` can be used as a placeholder in the text.

If the `source` property is set it is used to help the end-user to understand when and by what it is deprecated.
It can be set to:

- HTML major revision, e.g. `html5` or `html4`.
- HTML minor revision, e.g. `html53` or `html32`.
- `whatwg`: WHATWG Living Standard.
- `non-standard`: non-standard element implemented only by one or few browsers.
- your library or application name.

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

When set to `true` all children are checked.
When set to array only the listed tagnames or content categories are checked.

### `scriptSupporting`

Elements whose primary purpose is to support scripting should set this flag to `true`.
Some elements will generally only allow a very narrow set of children (such as `<ul>` only allowing `<li>`) but usually also allows [script-supporting elements][whatwg-scriptsupporting].

In HTML5 both the `<script>` and `<template>` tags are considered script-supporting but javascript frameworks and web-components may include additional tags.

[whatwg-scriptsupporting]: https://html.spec.whatwg.org/multipage/dom.html#script-supporting-elements-2

### `form`

Elements which are considered to be a form-element should set this flag to `true`.
In plain HTML only the `<form>` element is considered a form but when using custom components the form element might be wrapped inside and to make rules related to forms pick up the custom element this flag should be set.

### `labelable`

[Labelable elements][whatwg-labelable] are elements which can have an associated `<label>` element.
This is typically elements input elements such as `<input>`.

[whatwg-labelable]: https://html.spec.whatwg.org/multipage/forms.html#category-label

## Permitted content

### `attributes`

An object with allowed attribute values.

```typescript
export interface MetaAttribute {
  boolean?: boolean;
  deprecated?: boolean | string;
  enum?: Array<string | RegExp>;
  list?: boolean;
  required?: boolean;
  omit?: boolean;
}
```

```json
{
  "custom-element": {
    "attributes": {
      "foo": {
        "boolean": false,
        "omit": false,
        "enum": ["bar", "baz"]
      }
    }
  }
}
```

With this metadata the attribute `"foo"` may only have the values `"bar"` or`"foo"`.
The value cannot be omitted or be used as a boolean property.

This is used by the {@link attribute-allowed-values} rule.

An empty object may be set as well to mark the attribute as a known attribute but without any validation.

#### `attribute.enum`

The `enum` property is a list of allowed values the attribute can have.
It can be either strings or regular expressions using `"/../"` e.g `"/-?\\d+/"` to match numbers.
If unset any value is accepted.

#### `attribute.boolean`

The `boolean` property takes priority and if set it allows the value to be:

- Omitted: `required`
- Empty string: `required=""`
- The attribute key: `required="required"`

The {@link attribute-boolean-style} rule regulates which of the styles to use but the content validator considers all three styles to be valid for boolean attributes.

#### `attribute.omit`

The `omit` property allows the value to be either omitted or an empty string.
When using `omit` the empty string `""` is implied in `enum`.

The {@link attribute-empty-style} rule regulates whenever omitted values or empty string is preferred.

#### `attribute.deprecated`

If set to `true` or `string` this attribute is marked as deprecated and should not be used in new code.

This is used by the [no-deprecated-attr](/rules/no-deprecated-attr.html) rule.

#### `attribute.required`

If set to `true` this attribute is required to be present on the element.

This is used by the [element-required-attributes](/rules/element-required-attributes.html) rule.

#### `attribute.list`

If set to `true` the attribute value is parsed as a space-separated list (`DOMTokenList`) where each token is validated separately and each token must be valid for the attribute value to be consideted valid.

```json
{
  "custom-element": {
    "attributes": {
      "foo": {
        "list": true,
        "enum": ["a", "b"]
      }
    }
  }
}
```

Given the metadata above both `foo="a"` and `foo="b"` is valid.
When the attribute is `foo="a b"` each token (`a` and `b`) is validated separately and both must be valid.
Thus `foo="a b"` is valid but `foo="a c"` is not.

#### Deprecated method

The previous (now deprecated) method was to assign an enumerated list of valid values:

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

With this metadata the attribute `"foo"` may only have the values `"bar"` or `"foo"`.
Just as with the `enum` property regular expressions could be passed.

It features a number of quirks:

- The value `""` enabled both omitted and `""`.
- The empty list `[]` enabled boolean attribute.
- Some corner-cases could not be expressed.

While still supported this syntax should be migrated to the new syntax and is scheduled to be removed in the next major version.

### `requiredAttributes`

Deprecated: set `required` property directly on `attribute` instead.
See above.

### `deprecatedAttributes`

Deprecated: set `deprecated` property directly on `attribute` instead.
See above.

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

#### Combining (AND)

Permitted content matches if the element matches any of the entries.
Entires can also be combined so multiple entries must all match by wrapping entires in an array:

```js
"custom-elements": {
  "permittedContent": [
    ["@flow", {"exclude": "div"}]
  ]
}
```

This will allow any flow content except `<div>`.

Be careful when using multiple combined entries as each group will still match if any matches:

```js
"custom-elements": {
  "permittedContent": [
	"@flow",
    ["@phrasing", {"exclude": "em"}]
  ]
}
```

Since `<em>` will match `@flow` it will be allowed even if excluded by the next entry.

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
`<area>` element must have a `<map>` element as ancestor but not necessarily as
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
descendant of the element.

```js
"head": {
  "requiredContent": [
    "title"
  ]
}
```

This is used by [element-required-content](/rules/element-required-content.html)
rule.

### `textContent`

Enforces presence or absence of text in an element.
If unset it defaults to `default`.

Must be set to one of the following values:

- `none` - the element cannot contain text (whitespace ignored).
- `default` - the element can optionally have text.
- `required` - the element must have non-whitespace text present.
- `accessible` - the element must have accessible text, either regular text or using aria attributes such as `aria-label`.

This is used by [text-content](/rules/text-content.html) rule.

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
