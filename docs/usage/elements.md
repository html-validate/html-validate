---
docType: content
title: Elements metadata
nav: userguide
---

# Elements metadata

For proper validation each element must have a corresponding metadata entry.
If no metadata is present many rules will just ignore the element entirely.
To configure metadata sources use `elements: [...]`, see [configuring](/usage).

A typical custom element may look like:

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "custom-element": {
    flow: true,
  },
});
```

The `defineMetadata` helper is optional but helps the IDE with completion and type-checking.

Each entry can contain the following properties:

```ts nocompile
export interface MetaElement {
  /* content categories */
  metadata?: boolean | PropertyExpression | MetaCategoryCallback;
  flow?: boolean | PropertyExpression | MetaCategoryCallback;
  sectioning?: boolean | PropertyExpression | MetaCategoryCallback;
  heading?: boolean | PropertyExpression | MetaCategoryCallback;
  phrasing?: boolean | PropertyExpression | MetaCategoryCallback;
  embedded?: boolean | PropertyExpression | MetaCategoryCallback;
  interactive?: boolean | PropertyExpression | MetaCategoryCallback;

  /* element properties */
  deprecated?: boolean | string | DeprecatedElement;
  foreign?: boolean;
  void?: boolean;
  transparent?: boolean | string[];
  scriptSupporting?: boolean;
  focusable?: boolean | MetaFocusableCallback;
  form?: boolean;
  formAssociated?: FormAssociated;
  labelable?: boolean | MetaLabelableCallback;

  /* ignore DOM ancestry */
  templateRoot?: boolean;

  /* WAI-ARIA attributes */
  aria?: MetaAria;

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

export interface MetaAria {
  implicitRole?: string | ((node: HtmlElementLike) => string | null);
  naming?: "allowed" | "prohibited" | ((node: HtmlElementLike) => "allowed" | "prohibited");
}
```

## Content categories

Each content model property defines what type of element it is.
See [MDN][1] and [W3C][2] for description of the different categories.

For custom elements this should be set to `flow` or `phrasing` depending on the context it should be allowed in.
Essentially `flow` would equal a `div` or `display: block` while `phrasing` would equal a `span` or `display: inline` (which is default CSS for unknown elements).

[1]: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
[2]: https://www.w3.org/TR/html5/dom.html#kinds-of-content

Each property should either be a boolean (defaults to `false`) or a property expression in the form `string | [string, any]`.

### Property callbacks

If the element has conditions for which content categories it belongs to one can use callbacks.

For instance, the `<video>` element is interactive only if the `controls` attribute is present:

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  video: {
    interactive(node) {
      return node.hasAttribute("controls");
    },
  },
});
```

## Element properties

### `deprecated`

If truthy the element will trigger the [deprecated](/rules/deprecated.html) rule
when used.

Can be set to `true`, a string or an object.

```typescript
export interface DeprecatedElement {
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

### `focusable`

Focusable elements are elements which can natively receive focus, i.e. without having `tabindex` or another method to explicitly set it to be focusable.
This is typically elements input elements such as `<input>`.

### `form`

Elements which are considered to be a form-element should set this flag to `true`.
In plain HTML only the `<form>` element is considered a form but when using custom components the form element might be wrapped inside and to make rules related to forms pick up the custom element this flag should be set.

### `formAssociated`

```ts
export interface FormAssociated {
  disablable?: boolean;

  listed?: boolean;
}
```

[Form associated][whatwg-form-associated] elements are elements which have a form owner.
In particular `listed` form associated elements with a `name` attribute used with the `<form>` and `<fieldset>` `elements` property.
If the element is also submittable the `name` attribute defines the name used when the form is submitted.

[whatwg-form-associated]: https://html.spec.whatwg.org/multipage/forms.html#categories

#### `disablable`

Disablable elements can be disabled using the disabled attribute.

### `labelable`

[Labelable elements][whatwg-labelable] are elements which can have an associated `<label>` element.
This is typically elements input elements such as `<input>`.

[whatwg-labelable]: https://html.spec.whatwg.org/multipage/forms.html#category-label

### `templateRoot`

When set to `true`, this element has no impact on DOM ancestry.
I.e., the `<template>` element (where allowed) can contain anything, as it does not directly affect the DOM tree.

If unset, defaults to `false`.

### `aria.implicitRole`

- type: `string | ((node: HtmlElementLike) => string | null)`

Many native HTML elements has an implicit ARIA role (defined in [ARIA in HTML](https://www.w3.org/TR/html-aria/#docconformance)).

`aria.implicitRole` can either be set to:

- a `string` with an unconditional role.
- a callback returning a string. The `node` parameter is the element the the role is requested for. If the callback returns `null` the element has no corresponding role.

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  /* defines an element with a static implicit role */
  "custom-element": {
    aria: {
      implicitRole: "presentation",
    },
  },

  /* defines an element with the role of button only if the `foo` attribute is set */
  "other-element": {
    aria: {
      implicitRole(node) {
        if (node.hasAttribute("foo")) {
          return "button";
        } else {
          return "generic";
        }
      },
    },
  },
});
```

This property is also available as the deprecated `implicitRole` property (outside of the `aria` property).

#### `aria.naming`

- type: `"allowed" | "prohibited" | ((node: HtmlElementLike) => "allowed" | "prohibited" | null)`

Sets whenever the elements allows to be named by the `aria-label` or `aria-labelledby` attributes, i.e. whenever [naming is prohibited](https://www.w3.org/TR/html-aria/#dfn-naming-prohibited).

Can be set either to `"allowed"` or `"prohibited"`or a callback returning one of those.
Defaults is `"allowed"`.

Note that if the element has a `role` attribute the role determines if naming is prohibited or not.

## Permitted content

### `attributes`

An object with allowed attribute values.

```ts
import { type DynamicValue, type HtmlElementLike } from "html-validate";

/* --- */

export interface MetaAttribute {
  allowed?: (
    node: HtmlElementLike,
    attr: string | DynamicValue | null,
  ) => string | null | undefined;
  boolean?: boolean;
  deprecated?: boolean | string;
  enum?: Array<string | RegExp>;
  list?: boolean;
  required?: boolean;
  omit?: boolean;
}
```

```ts
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "custom-element": {
    attributes: {
      foo: {
        boolean: false,
        omit: false,
        enum: ["bar", "baz"],
      },
    },
  },
});
```

With this metadata the attribute `"foo"` may only have the values `"bar"` or`"foo"`.
The value cannot be omitted or be used as a boolean property.

This is used by the {@link attribute-allowed-values} rule.

An empty object may be set as well to mark the attribute as a known attribute but without any validation.

#### `attribute.allowed`

The `allowed` property can be set to a callback taking a single element.
If the callback returns an error string the attribute cannot be used in the given context.

- The `node` parameter is the element the attribute belongs to.
- The `attr` parameter is the value of the current attribute under consideration, e.g. the value of `foo` in the next example.

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "custom-element": {
    attributes: {
      foo: {
        allowed(node) {
          if (!node.hasAttribute("bar")) {
            return "needs a bar attribute";
          } else {
            return null;
          }
        },
      },
    },
  },
});
```

Helper functions for writing callbacks are available in {@link api:MetadataHelper}.

This is used by the {@link attribute-misuse} rule to check if an attribute is allowed or not in the context.

Calling `allowed(..)` with a native `HTMLElement` (or JSDOM) works but is not officially supported and the API may change over time outside of major releases.

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

```json
{
  "custom-element": {
    "attributes": {
      "foo": ["bar", "baz"]
    }
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

```json
{
  "custom-elements": {
    "permittedContent": ["transclude-slot-1", "transclude-slot-2"]
  }
}
```

This is used by
[element-permitted-content](/rules/element-permitted-content.html) rule.

#### Excluding

This is normally a whitelist of elements but can be switched to a blacklist by
using `exclude`:

```json
{
  "custom-elements": {
    "permittedContent": [{ "exclude": "@interactive" }]
  }
}
```

#### Combining (AND)

Permitted content matches if the element matches any of the entries.
Entires can also be combined so multiple entries must all match by wrapping entires in an array:

```json
{
  "custom-elements": {
    "permittedContent": [["@flow", { "exclude": "div" }]]
  }
}
```

This will allow any flow content except `<div>`.

Be careful when using multiple combined entries as each group will still match if any matches:

```json
{
  "custom-elements": {
    "permittedContent": ["@flow", ["@phrasing", { "exclude": "em" }]]
  }
}
```

Since `<em>` will match `@flow` it will be allowed even if excluded by the next entry.

#### Limit occurrences

If a child is only allowed once it can be suffixed with `?` to limit to 0 or 1
number of occurrences.

```json
{
  "table": {
    "permittedContent": ["caption?"]
  }
}
```

This will disallow `<caption>` from being used more than once under `<table>`.

This is used by
[element-permitted-occurrences](/rules/element-permitted-occurrences.html) rule.

### `permittedDescendants`

Same as `permittedContent` but checks all descendants and not just intermediate
children. Both can be used together, e.g `<article>` is defined as:

```json
{
  "article": {
    "permittedContent": ["@flow"],
    "permittedDescendants": [{ "exclude": ["main"] }]
  }
}
```

Thus is allows any flow content but disallows `<main>` as a descendant.

This is used by
[element-permitted-content](/rules/element-permitted-content.html) rule.

### `permittedOrder`

Requires children to be used in a specific order.

Elements listed has to occur in the same order as specified, elements which is
not specified can appear anywhere.

```json
{
  "table": {
    "permittedOrder": ["thead", "tbody", "tfoot"]
  }
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

```json
{
  "dt": {
    "requiredAncestors": ["dl > dt", "dl > div > dt"]
  }
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

```json
{
  "head": {
    "requiredContent": ["title"]
  }
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

```json
{
  "*": {
    "attributes": {
      "tabindex": ["/-?\\d+/"]
    }
  }
}
```

## Inheritance

Elements can inherit from other elements using the `inherits` property.
When inheriting all properties will be duplicated to the new element.
Any new property set on the element will override the parent element.

Given the following metadata:

```json
{
  "foo": {
    "flow": true,
    "transparent": true
  },
  "bar": {
    "inherit": "foo",
    "transparent": false
  }
}
```

The final `<bar>` metadata will be merged to:

```json
{
  "foo": {
    "flow": true,
    "transparent": true
  },
  "bar": {
    "flow": true,
    "transparent": false
  }
}
```

Elements being inherited must be defined before the inheritor or an error will be thrown.

### Attribute inheritance

Attributes will be inherited but can be overwritten, given the following:

```ts
import { defineMetadata } from "html-validate";

export default defineMetadata({
  vehicle: {
    attributes: {
      tires: {
        required: true,
        enum: ["2", "4"],
      },
      color: {
        required: true,
        enum: ["red", "blue", "white"],
      },
    },
  },
  car: {
    inherit: "vehicle",
    attributes: {
      tires: {
        required: false,
        enum: ["4"],
      },
    },
  },
});
```

The `<car>` element will still require the `color` attribute but not the `tires` attribute and only `"4"` will be allowed.

The attribute could also be removed from the inheritor by setting it to `null`:

```ts
import { defineMetadata } from "html-validate";

export default defineMetadata({
  vehicle: {
    attributes: {
      tires: {
        required: true,
        enum: ["2", "4"],
      },
      color: {
        required: true,
        enum: ["red", "blue", "white"],
      },
    },
  },
  car: {
    inherit: "vehicle",
    attributes: {
      tires: null,
    },
  },
});
```
