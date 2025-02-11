---
docType: content
title: Writing custom element metadata - A simple component
nav: metadata
---

# Writing custom element metadata: A simple component

HTML-Validate is fully data-driven and has no hardcoded rules for which elements exists and how they should work.
This data is called _element metadata_ and the validator bundles metadata for all HTML5 elements but makes no distinction between the bundled and user-provided metadata.

The bundled metadata is available in [html5.json](https://gitlab.com/html-validate/html-validate/-/blob/master/src/elements/html5.ts).

See also:

- {@link schema:elements JSON Schema}.
- {@link usage/elements Full metadata documentation}.

## The component

Lets assume we have a custom element called `<my-component>`.
If this element has no metadata anything goes for this element and the validator cannot help much.
Lets start off with some examples:

<validate name="no-metadata-1" results="true">
  <!-- this is probably legal? -->
  <div>
    <my-component>lorem ipsum</my-component>
  </div>

  <!-- but should it work inside a span? -->
  <span>
    <my-component>lorem ipsum</my-component>
  </span>
</validate>

Depending on what the element consists of it might not be appropriate to use inside a `<span>` but there is not yet any metadata available to tell if `<my-component>` is allowed to be used in that context.

<validate name="no-metadata-2" results="true">
  <!-- can it contain an interactive button? who knows? -->
  <my-component>
    <button type="button">click me!</button>
  </my-component>

  <!-- or is it allowed inside a button? -->
  <button type="button">
    <my-component>click me!</my-component>
  </button>
</validate>

Similarly there is not yet a way to tell if a button is allowed inside the component or if it may be used inside one.
Consider what would happen if `<my-component>` wraps the content in an `<a>`.

<validate name="no-metadata-3" results="true">
  <!-- lets nest the component for fun and profit! -->
  <my-component>
    <my-component>
      <my-component>
        Sup dawg I heard you like components so I put components inside your components.
      </my-component>
    </my-component>
  </my-component>
</validate>

Most of the time it would make little sense to nest components but sometimes it isn't as obvious when it happens.
Perhaps the nesting isn't direct but happens way down in the DOM tree.

All of above considered valid unless the metadata gives instructions how the element should be used.
The first step is creating a new file, e.g. `elements.js` and configure the validator to read it.

`elements.js`:

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {},
});
```

Configure with:

```json config
{
  "extends": ["html-validate:recommended"],
  "elements": ["html5", "./elements.js"]
}
```

Rerunning the validation will now have the complete opposite effect, the element will not be allowed anywhere:

<validate name="basic-metadata" elements="simple-component-basic.json">
  <div>
    <my-component>lorem ipsum</my-component>
  </div>
</validate>

This happens because we have not yet told the validator what kind of element it is, we only provided it with empty metadata.
Most properties default to `false` or `[]`.

::: tip

Use the {@link rules/no-unknown-elements `no-unknown-elements`} rule to find elements you have not yet provided metadata for.

:::

## Content categories

The first step to writing metadata is to decide which [content category][mdn-content-category] the element belongs to.
It can be one or many but most elements will probably only use `flow` and/or `phrasing`.
A bit simplified but flow elements can be thought as block-level `<div>` and phrasing as inline `<span>` (but all phrasing elements are also flow elements).

[mdn-content-category]: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories

For instance, if our `<my-component>` element were to work similar to a `<div>` we can set the `flow` property to `true`.

```diff
 import { defineMetadata } from "html-validate";

 export default defineMetadata({
   "my-component": {
+    flow: true,
   },
 });
```

The element will now be accepted inside another `<div>` as flow elements can be nested inside each other.

<validate name="flow-metadata-1" elements="simple-component-flow.json" results="true">
  <div>
    <my-component>lorem ipsum</my-component>
  </div>
</validate>

It can not be nested inside a `<span>` as a `<span>` does not accept flow content (only other phrasing elements):

<validate name="flow--metadata-2" elements="simple-component-flow.json" results="true">
  <span>
    <my-component>lorem ipsum</my-component>
  </span>
</validate>

If we set the `phrasing` property as well the element will be allowed inside a `<span>` too:

```diff
 import { defineMetadata } from "html-validate";

 export default defineMetadata({
   "my-component": {
     flow: true,
+    phrasing: true,
   },
 });
```

<validate name="phrasing-metadata" elements="simple-component-phrasing.json" results="true">
  <span>
    <my-component>lorem ipsum</my-component>
  </span>
</validate>

Some elements might want only one or the other and some want both.
Most of the time a phrasing elements belongs to both the flow and phrasing categories but the opposite is not true.

::: tip Rule of thumb

- If the component is meant to be used where a `<span>` would go set both `flow` and `phrasing` to `true`.
- If the component is meant to be used where a `<div>` would go set only `flow` to `true`.
- If the component wraps a `<a>` or `<button>` element set `interactive` to `true`.

:::

There are other content categories as well, check the [element metadata reference](/usage/elements.html) and the official HTML5 specification for details of each one.

## Case study: `<div>`

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  div: {
    flow: true,
    permittedContent: ["@flow"],
  },
});
```

As a generic flow content container the `<div>` element simply sets the `flow` property and uses the `permittedContent` property to restrict its content to only allow other flow content (in practice this means almost all other elements).
In the next part, {@link guide/metadata/restrict-content restricting element content}, you will learn how to restrict both content and context of your components.
