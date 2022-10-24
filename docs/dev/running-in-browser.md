---
docType: content
title: Running in a browser
---

# Running in a browser

While primarly developed as a NodeJS CLI/backend tool it is possible to run `html-validate` in a browser as well.

<div class="alert alert-info">
	<i class="fa-solid fa-info-circle" aria-hidden="true"></i>
	<strong>Note</strong>
	<p>While it is possible to get <code>html-validate</code> running in a browser it is currently not supported and requires a few workarounds.</p>
</div>

Improvements are welcome!

## Base implementation

This article assume you are trying to get something similar to this code to run in the browser.

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate();
const report = htmlvalidate.validateString(markup, "my-file.html");
```

### Example

There is an example project [try-online][try-online-repo] running at [online.html-validate.org][try-online-url] showing that it can be done and the workarounds required.

[try-online-repo]: https://gitlab.com/html-validate/try-online
[try-online-url]: https://online.html-validate.org/

## Browser bundle

The first step is to make sure the correct bundle is used.
The library contains both a full build and a browser build, if your bundler fails to pick up the right one you need to be explicit:

```diff
-import { HtmlValidate } from "html-validate";
+import { HtmlValidate } from "html-validate/browser";
```

## Configuration loading

By default `html-validate` will traverse the filesystem looking for configuration files (e.g. `.htmlvalidate.json`).
This is true even when using `validateString(..)`.

This will manifest itself with errors such as:

- `Cannot find module 'fs'`
- `Cannot read property 'existsSync' of undefined`
- `fs_1.default.existsSync is not a function`

To get around this the {@link dev/using-api#staticconfigloader `StaticConfigLoader`} (or a custom loader) can be used:

```diff
-import { HtmlValidate } from "html-validate"
+import { StaticConfigLoader, HtmlValidate } from "html-validate/browser";

-const htmlvalidate = new HtmlValidate();
+const loader = new StaticConfigLoader();
+const htmlvalidate = new HtmlValidate(loader);
 const report = htmlvalidate.validateString(markup, "my-file.html");
```

The {@link dev/using-api#staticconfigloader `StaticConfigLoader`} will only load the configuration passed to the constructor or to `validateString(..)`.
By default it uses the `html-validate:recommended` preset but can be overridden by passing a different to the constructor:

```diff
-const loader = new StaticConfigLoader();
+const loader = new StaticConfigLoader({
+  extends: ["html-validate:standard"],
+  elements: ["html5"],
+});
 const htmlvalidate = new HtmlValidate(loader);
```

### Previous workaround

The previous workaround was to pass a configuration to the {@link dev/using-api `HtmlValidate`} constructor with the `root` property set to `true` but this is no longer recommended for this purpose:

```diff
-const htmlvalidate = new HtmlValidate();
+const htmlvalidate = new HtmlValidate({
+  root: true,
+  extends: ["html-validate:recommended"],
+});
```

Note that no default configuration will be loaded either so you must explicitly enable rules or extend a preset.

## Bundled files

The `html-validate` NPM package contains a few data files such as `elements/html.json`.
These files are dynamically imported and will most likely not be picked up by your bundler.
Either you need to ensure the bundler picks up the files or the configuration loader does not need to import thme.

- `elements/*.json`

This will manifest itself with errors such as:

- `Error: Failed to load elements from "html5": Cannot find module 'html5'`

This is typically archived by passing an object instead of a string when configuring `html-validate`:

```diff
 import { StaticConfigLoader, HtmlValidate } from "html-validate/browser";

+// check your webpack loader! it must return a plain object (not `default: { ... }`, a path/url, etc)
+import html5 from "html-validate/elements/html5.json";

 const loader = new StaticConfigLoader({
   extends: ["html-validate:recommended"],
-  elements: ["html5"],
+  elements: [html5],
 });
 const htmlvalidate = new HtmlValidate(loader);
```

## Webpack

Internally there are many dynamic imports and `fs` access.

You will see warnings such as:

    WARNING in ./node_modules/html-validate/dist/config/config.js 81:25-50
    Critical dependency: the request of a dependency is an expression

In many cases there is no way to avoid the warning per se but the workaround above are implemented the code paths triggering these issues are not hit.
