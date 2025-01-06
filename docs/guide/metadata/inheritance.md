---
docType: content
title: Writing custom element metadata - Inheritance
nav: metadata
---

# Writing custom element metadata: Inheritance

When writing custom elements it is common to wrap builtin elements and thus wanting to use the same rules.
One method is to simply copy it over to the component but then it won't be updated in case the original updates.
A better method is to use inheritance.

Lets assume our `<my-component>` is actually a wrapper for an input field with a label and the content is what is used as `<label>`.
Thus by inheriting from `<label>` we automatically get the same rules.

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    inherit: "label",
  },
});
```

<validate name="inheritance" elements="inheritance.json">
  <my-component>
    <span>lorem ipsum</span>
  </my-component>
  <my-component>
    <div>lorem ipsum</div>
  </my-component>
</validate>

When inheriting you can still override any properties from the inherited element.

::: warning

Some elements has properties not suitable for inheriting.
For instance `<input>` is a `void` element but custom elements cannot be pure `void` thus if you inherit from it you must set `void` to `false`.

:::

Inheritance is implied when overwriting existing elements, e.g. when overwriting builtin elements or loading multiple definitions of the same component.
