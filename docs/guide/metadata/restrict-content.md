---
docType: content
title: Writing custom element metadata - Restricting element content
nav: metadata
---

# Writing custom element metadata: Restricting element content

Looking back at our initial example we saw that the element accepted a `<button>` as content.
If we want to allow only phrasing content (`<span>`, `<strong>`, etc) inside we can use the `permittedContent` property to limit.
`permittedContent` is a list of allowed tags or content categories.

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    flow: true,
    permittedContent: ["span", "strong", "em"],
  },
});
```

<validate name="tags" elements="restrict-content-tags.json">
  <my-component>
    <button type="button">click me!</button>
  </my-component>
</validate>

As it quickly get tedious to list all tag names we can refer to content categories directly:

```diff
 import { defineMetadata } from "html-validate";

 export default defineMetadata({
   "my-component": {
     flow: true,
-    permittedContent: ["span", "strong", "em"],
+    permittedContent: ["@phrasing"],
   },
 });
```

The list can also be turned to a blacklist by using the `exclude` keyword:

```diff
 import { defineMetadata } from "html-validate";

 export default defineMetadata({
   "my-component": {
     flow: true,
-    permittedContent: ["span", "strong", "em"],
+    permittedContent: [{ "exclude": "@heading" }],
   },
 });
```

<validate name="exclude" elements="restrict-content-exclude.json">
  <my-component>
    <div>allowed</div>
    <span>also allowed</span>
    <h1>not allowed</h1>
  </my-component>
</validate>

<div class="alert alert-info">
	<i class="fa-solid fa-info-circle" aria-hidden="true"></i>
	<strong>Tips</strong>
	<p><code>exclude</code> is also useful to prevent interactive elements from disallowing other interactive elements by excluding <code>@interactive</code></p>
</div>

## Descendants

`permittedContent` validates direct children to the element but not deeper descendants.
The related `permittedDescendants` property checks all descendants.
Most of the time you should prefer `permittedContent` over `permittedDescendants` as each children should have its own metadata describing what should and should not be allowed and by allowing the element itself you should accept any descendants it may pull.
However, it can be used in circumstances where this is not possible.
The most common case is to prevent nesting of the component or limit usage of certain content categories such as sectioning or headings:

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  "my-component": {
    flow: true,
    permittedDescendants: [{ exclude: ["my-component", "@sectioning"] }],
  },
});
```

<validate name="descendants" elements="restrict-content-descendants.json">
  <my-component>
  <!-- the div itself is allowed -->
    <div>
      <footer>
        sectioning element can no longer be used
      </footer>
      <my-component>
        nor can the component be nested
      </my-component>
    </div>
    <span>also allowed</span>
    <h1>not allowed</h1>
  </my-component>
</validate>

<div class="alert alert-info">
	<i class="fa-solid fa-info-circle" aria-hidden="true"></i>
	<strong>Rule of thumb</strong>
	<ul>
		<li>Use <code>permittedContent</code> to limit the elements you want to allow as content.</li>
		<li>Use <code>permittedDescendants</code> to prevent nestling.</li>
		<li>If the component wraps a <code>&lt;a&gt;</code> or <code>&lt;button&gt;</code> element use <code>permittedDescendants</code> exclude other interactive elements.</li>
	</ul>
</div>

Other properties to limit content also exits, check the [element metadata reference](/usage/elements.html) for details.

### Case study: `<html>`

(simplified for brevity)

```js
import { defineMetadata } from "html-validate";

export default defineMetadata({
  html: {
    permittedContent: ["head?", "body?"],
    permittedOrder: ["head", "body"],
    requiredContent: ["head", "body"],
  },
});
```

Like we seen before the `permittedContent` property is used to restrict to only accept the `<head>` and `<body>` elements.
Note the usage of a trailing `?`, this limits the allowed occurrences to 0 or 1 (2 or more is disallowed).
Default is to allow any number of occurrences.

Next it uses `permittedOrder` to declare that `<head>` must come before `<body>`.
`permittedOrder` doesn't have to list all the possible elements from `permittedContent` but for the items listed the order must be adhered to.
Contents groups such as `@flow` is allowed and unlisted elements can be used in any anywhere (even between listed elements).

Lastly it uses `requiredContent` to declare that both `<head>` and `<body>` must be present.

To sum up, the `<html>` elements puts the following restrictions in place:

- It must contain a single `<head>` element.
- It must contain a single `<body>` element.
- The `<head>` element must come before the `<body>` element.
