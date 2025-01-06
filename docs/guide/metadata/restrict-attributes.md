---
docType: content
title: Writing custom element metadata - Restricting element attributes
nav: metadata
---

# Writing custom element metadata: Restricting element attributes

Similar to {@link guide/metadata/restrict-content restricting content} restricting attributes comes in a few different versions.
To define what values attribute accept the `attributes` property is used, to define what attributes are required use `requiredAttributes` and to mark an attribute as deprecated use `deprecatedAttributes`.

## Define attribute values

Assuming our `<my-component>` element has a `duck` attribute which can take the value `huey`, `dewey` or `louie` we can use the `attributes` property to define an enumerated list of allowed values:

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    flow: true,
    attributes: {
      duck: {
        enum: ["huey", "dewey", "louie"],
      },
    },
  },
});
```

<validate name="enum" elements="restrict-attributes-enum.json">
  <my-component duck="dewey">...</my-component>
  <my-component duck="flintheart">...</my-component>
</validate>

We can also specify regular expressions by surrounding the string with `/` (remember to escape special characters properly):

```diff
 import { defineMetadata } from "html-validate";

 export default defineMetadata({
   "my-component": {
     flow: true,
     attributes: {
       duck: {
-        enum: ["huey", "dewey", "louie"],
+        enum: ["/\\d+/"],
       },
     },
   },
 });
```

<validate name="regexp" elements="restrict-attributes-regexp.json">
  <my-component ducks="3">...</my-component>
  <my-component ducks="huey">...</my-component>
</validate>

::: tip

Regular expressions and enumeration can be used at the same time.

:::

To force a boolean value similar to `disabled`, `selected` etc instead set the `boolean` property to `true`.

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    flow: true,
    attributes: {
      quacks: {
        boolean: true,
      },
    },
  },
});
```

<validate name="boolean" elements="restrict-attributes-boolean.json">
  <my-component quacks>...</my-component>
  <my-component quacks="duck">...</my-component>
</validate>

If the value can be omitted (same as the empty value `""`) set the `omit` property to `true`.
This is often combined with `enum` but it should have a default value.

For instance, to allow the `quacks` attribute to be set to either `duck` or `dog` but at the same time not require a value to be set at all `omit` can be used.

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    flow: true,
    attributes: {
      quacks: {
        omit: true,
        enum: ["duck", "dog"],
      },
    },
  },
});
```

<validate name="omit" elements="restrict-attributes-omit.json">
  <my-component quacks>...</my-component>
  <my-component quacks="duck">...</my-component>
</validate>

## Required attributes

Required attributes (attributes that must be set on an element) can be specified by setting `required` to `true`:

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    flow: true,
    attributes: {
      duck: {
        required: true,
      },
    },
  },
});
```

<validate name="required" elements="restrict-attributes-required.json">
  <my-component duck="dewey">...</my-component>
  <my-component>...</my-component>
</validate>

## Deprecating attributes

Similar to required attribute we can set `deprecated` to true or a message to mark an attribute as deprecated:

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    flow: true,
    attributes: {
      duck: {
        deprecated: true,
      },
    },
  },
});
```

<validate name="deprecated" elements="restrict-attributes-deprecated.json">
  <my-component duck="dewey">...</my-component>
  <my-component>...</my-component>
</validate>
