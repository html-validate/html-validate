---
docType: content
title: Running in a browser
---

# Running in a browser

While primarly developed as a NodeJS CLI/backend tool it is possible to run `html-validate` in a browser as well.

<div class="alert alert-info">
	<i class="fa fa-info-circle" aria-hidden="true"></i>
	<strong>Note</strong>
	<p>While it is possible to get <code>html-validate</code> running in a browser it is currently not supported and requires a few workarounds.</p>
</div>

Improvements are welcome!

## Example

There is an example project [try-online-repo] running at [try-online-url] showing that it can be done and the workarounds required.

[try-online-repo]: https://gitlab.com/html-validate/try-online
[try-online-url]: https://online.html-validate.org/

## Configuration loading

By default `html-validate` will traverse the filesystem looking for configuration files (e.g. `.htmlvalidate.json`).
This is true even when using `validateString(..)`.

This will manifest itself with errors such as:

- `Cannot find module 'fs'`
- `Cannot read property 'existsSync' of undefined`
- `fs_1.default.existsSync is not a function`

### Workaround 1: prevent loader from trying to access filesystem

By far the easiest method is to pass a config to the [[HtmlValidate]] constructor with the `root` property to `true`:

```ts
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate({
  root: true,
  extends: ["html-validate:recommended"],
});
```

Do note that no default configuration will be loaded either so you must explicitly enable rules or extend a preset.

### Workaround 2:

If you are emulating or providing virtual access to a filesystem you can ensure the `fs` module is implemented.
There is no exhaustive list of functions which must be added.

If you are using webpack you can use `resolve.alias` to implement this:

```js
module.exports = {
  resolve: {
    alias: {
      fs$: path.resolve(__dirname, "src/my-fs.js"),
    },
  },
};
```

## Bundled files

The `html-validate` NPM package contains a few data files such as `elements/html.json`.
These files are dynamically imported and will most likely not be picked up by your bundler.
Either you need to ensure the bundler picks up the files or the configuration loader does not need to import thme.

- `elements/*.json`

This will manifest itself with errors such as:

- `Error: Failed to load elements from "html5": Cannot find module 'html5'`

This is typically archived by passing an object instead of a string when configuring `html-validate`:

```diff
 import { HtmlValidate } from "html-validate";

+// check your loader! it must return a plain object (not `default: { ... }`, a path/url, etc)
+import html5 from "html-validate/elements/html5.json";

 const htmlvalidate = new HtmlValidate({
   root: true,
   extends: ["html-validate:recommended"],
-  elements: ["html5"],
+  elements: [html5]
});
```

## Webpack

Internally there are many dynamic imports and `fs` access.

You will see warnings such as:

    WARNING in ./node_modules/html-validate/dist/config/config.js 81:25-50
    Critical dependency: the request of a dependency is an expression

In many cases there is no way to avoid the warning per se but the workaround above are implemented the code paths triggering these issues are not hit.
