---
docType: content
title: Running in a browser
nav: devguide
---

# Running in a browser

While primarly developed as a NodeJS CLI/backend tool it is possible to run `html-validate` in a browser as well.

## Base implementation

This article assume you are trying to get something similar to this code to run in the browser.

```ts
import { HtmlValidate } from "html-validate";

const markup = "<button></button>";
const htmlvalidate = new HtmlValidate();
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const report = await htmlvalidate.validateString(markup, "my-file.html");
```

### Example

There is an example project [try-online][try-online-repo] running at [online.html-validate.org][try-online-url] showing that it can be done and the workarounds required.

[try-online-repo]: https://gitlab.com/html-validate/try-online
[try-online-url]: https://online.html-validate.org/

## Browser bundle

The library contains both a full build (requiring NodeJS to run) and a browser build.
If your bundler sets the `browser` [subpackage condition](https://nodejs.org/api/packages.html#community-conditions-definitions) or respects the `browser` field it should pick up the correct bundle automatically.

If your bundler fails to pick up the right one you need to be explicit:

```diff
-import { HtmlValidate } from "html-validate";
+import { HtmlValidate } from "html-validate/browser";
```

The examples in this guide assumes the bundler picks up the correct one.

## Configuration loading

Since v8.0.0 {@link dev/using-api#staticconfigloader `StaticConfigLoader`} is used by default but you might want to explicitly enable it:

```diff
-import { HtmlValidate } from "html-validate"
+import { StaticConfigLoader, HtmlValidate } from "html-validate";

-const htmlvalidate = new HtmlValidate();
+const loader = new StaticConfigLoader();
+const htmlvalidate = new HtmlValidate(loader);
 const report = await htmlvalidate.validateString(markup, "my-file.html");
```

The `StaticConfigLoader` will only load the configuration passed to the constructor or to `validateString(..)`.
By default it uses the `html-validate:recommended` preset but can be overridden by passing a different to the constructor:

```diff
-const loader = new StaticConfigLoader();
+const loader = new StaticConfigLoader({
+  extends: ["html-validate:standard"],
+  elements: ["html5"],
+});
 const htmlvalidate = new HtmlValidate(loader);
```

Do note that no external configurations, elements plugins or transformers will be loaded, only the builtin configurations adn elements will be available.

If you need addtional ones you must also use {@link dev/using-api#resolvers `StaticResolver`}:

```diff
+import { MyAwesomePlugin } from "my-awesome-plugin";
+
+const resolver = staticResolver({
+  plugins: {
+  "my-awesome-plugin": MyAwesomePlugin,
+  },
+});

-const loader = new StaticConfigLoader({
-  extends: ["html-validate:standard"],
+const loader = new StaticConfigLoader([resolver], {
+  plugins: ["my-awesome-plugin"],
+  extends: ["html-validate:standard", "my-awesom-plugin:recommended"],
   elements: ["html5"],
 });
 const htmlvalidate = new HtmlValidate(loader);
```

Starting with v9.0.0 it is also possible to use `esmResolver` and an [importmap][importmap].
The `esmResolver` will import using dynamic `import(..)`.

::: warning

The browser version of `esmResolver` will not fail gracefully if the imported module does not exist.

It assumes the module will be resolvable. If you use multiple resolvers the `esmResolver` should be run last as the next resolver will never be tried.

:::

[importmap]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap

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

Since v7.8.0 all files previously stored in `elements/*.{js,json,d.ts}` are now bundled in the same build and it is no longer needed to manually configure your loaded to include these files.

If you had this configured before you can now remove it:

```diff
 import { StaticConfigLoader, HtmlValidate } from "html-validate";

-// check your webpack loader! it must return a plain object (not `default: { ... }`, a path/url, etc)
-import html5 from "html-validate/elements/html5.json";

 const loader = new StaticConfigLoader({
   extends: ["html-validate:recommended"],
-  elements: [html5],
+  elements: ["html5"],
 });
 const htmlvalidate = new HtmlValidate(loader);
```

## Webpack

Internally there are many dynamic imports and `fs` access.

You will see warnings such as:

    WARNING in ./node_modules/html-validate/dist/config/config.js 81:25-50
    Critical dependency: the request of a dependency is an expression

In many cases there is no way to avoid the warning per se but the workaround above are implemented the code paths triggering these issues are not hit.
