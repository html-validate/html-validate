---
docType: content
name: writing-plugins
title: Writing plugins
nav: devguide
---

# Writing plugins

A plugin must expose a single object implementing the following interface:

```typescript
import {
  ConfigData,
  EventHandler,
  RuleConstructor,
  SchemaValidationPatch,
  Source,
} from "html-validate";

/* --- */

export interface Plugin {
  /**
   * Name of the plugin.
   *
   * If specified this is the name used when referring to the plugin. Default is
   * to use the name/path the user used when loading the plugin. To be less
   * confusing for users you should use the same name as your package.
   *
   * The name must be a valid package name according to NPM (basically lowercase
   * characters, must not begin with dot, slash or non-url safe characters).
   *
   * Hint: import and use the name from `package.json`.
   */
  name?: string | null;

  /**
   * Initialization callback.
   *
   * Called once per plugin during initialization.
   */
  init?(): void;

  /**
   * Setup callback.
   *
   * Called once per source after engine is initialized.
   *
   * @param source - The source about to be validated. Readonly.
   * @param eventhandler - Eventhandler from parser. Can be used to listen for
   * parser events.
   */
  setup?(source: Source, eventhandler: EventHandler): void;

  /**
   * Configuration presets.
   *
   * Each key should be the unprefixed name which a configuration later can
   * access using `${plugin}:${key}`, e.g. if a plugin named "my-plugin" exposes
   * a preset named "foobar" it can be accessed using:
   *
   * "extends": ["my-plugin:foobar"]
   */
  configs?: Record<string, ConfigData | null> | null;

  /**
   * List of new rules present.
   */
  rules?: Record<string, RuleConstructor<any, any> | null> | null;

  /**
   * Transformer available in this plugin.
   *
   * Can be given either as a single unnamed transformer or an object with
   * multiple named.
   *
   * Unnamed transformers use the plugin name similar to how a standalone
   * transformer would work:
   *
   * "transform": {
   *   "^.*\\.foo$": "my-plugin"
   * }
   *
   * For named transformers each key should be the unprefixed name which a
   * configuration later can access using `${plugin}:${key}`, e.g. if a plugin
   * named "my-plugin" exposes a transformer named "foobar" it can be accessed
   * using:
   *
   * "transform": {
   *   "^.*\\.foo$": "my-plugin:foobar"
   * }
   */
  transformer?: Transformer | Record<string, Transformer | null> | null;

  /**
   * Extend metadata validation schema.
   */
  elementSchema?: SchemaValidationPatch | null;
}
```

A plugin with a custom rule (e.g. {@link writing-rules NoButtonsRule}) might look like:

```ts fake-require
import { definePlugin } from "html-validate";
import NoButtonsRule from "./rules/no-buttons";

export default definePlugin({
  name: "my-plugin",
  rules: {
    "my-plugin/no-buttons": NoButtonsRule,
  },
});
```

To use this plugin add this configuration:

```diff
 {
   "extends": ["html-validate:recommended"],
   "elements": ["html5"],
+  "plugins": ["./my-plugin"],
+  "rules": {
+    "my-plugin/no-buttons": "error"
+  }
 }
```

The [Example plugin](https://gitlab.com/html-validate/example-plugin) repository contains example boilerplate you can use as a base for your plugin.

## Callbacks

### `init()`

The `init` callback is called once during validation engine initialization and
can be used to initialize resources required later.

Note: when validating multiple files the validation engine is recreated for each
file (as the configuration might change) thus this callback can still be called
multiple times. If you need initialization that happens exactly once for any
scenario you can run it in your plugin file global scope.

### `setup(source: Source, eventhandler: EventHandler)`

Called once per source and can be used to prepare the plugin for validation,
e.g. rules that requires initialization.

If needed the callback may setup event listeners for [parser
events](/dev/events.html) (same as rules).

The callback may not manipulate the source object.

## Configuration presets

Plugins can create configuration presets similar to a shared configuration:

```ts fake-require
import { definePlugin } from "html-validate";
import NoButtonsRule from "./rules/no-buttons";

export default definePlugin({
  name: "my-plugin",
  rules: {
    "my-plugin/no-buttons": NoButtonsRule,
  },
  configs: {
    recommended: {
      rules: {
        "my-plugin/no-buttons": "error",
      },
    },
  },
});
```

Users may then extend the preset using the plugin and preset name separated by a colon (`my-plugin:recommended` in this case):

```diff
 {
-  "extends": ["html-validate:recommended"],
+  "extends": ["html-validate:recommended", "my-plugin:recommended],
   "elements": ["html5"],
   "plugins": ["./my-plugin"]
-  "rules": {
-    "my-plugin/no-buttons": "error"
-  }
 }
```

## Rules

See [writing rules](/dev/writing-rules.html) for details on how to write a rules.

To expose rules in the plugin use the `rules` field.
Each plugin should use a unique prefix for each rule.

```ts fake-require
import { definePlugin } from "html-validate";
import MyRule from "./rules/my-rule.js";
import AnotherRule from "./rules/another-rule.js";

export default definePlugin({
  rules: {
    "my-prefix/my-rule": MyRule,
    "my-prefix/another-rule": AnotherRule,
  },
});
```

This makes the rules accessible as usual when configuring in
`.htmlvalidate.json`:

```json
{
  "plugins": ["my-fancy-plugin"],
  "rules": {
    "my-prefix/my-rule": "error"
  }
}
```

## Transformer

Similar to standalone transformers plugins may also expose them. This can be
useful to combine transformations, rules and a default set of configuration
suitable for the filetype/framework.

```ts fake-require
import { definePlugin } from "html-validate";
import MyTransformer from "./transformers/my-transformer.js";

export default definePlugin({
  transformer: MyTransformer,
});
```

Users may then extend the preset using the plugin name, e.g.:

```json
{
  "transform": {
    "^.*\\.foo$": "my-plugin"
  }
}
```

If you need multiple transformers export an object with named transformers instead:

```ts fake-require
import { definePlugin } from "html-validate";
import MyTransformer from "./transformers/my-transformer.js";

export default definePlugin({
  transformer: {
    "my-transformer": MyTransformer,
  },
});
```

Users may then extend the preset using `plugin:name`, e.g.:

```json
{
  "transform": {
    "^.*\\.foo$": "my-plugin:my-transformer"
  }
}
```

If you expose a transformer named `default` it will be loaded when using the plugin as name, i.e. `my-plugin` and `my-plugin:default` is equivalent.

## Extend metadata

Plugins can extend the available [element metadata](/usage/elements.html) by
setting `elementSchema` with an additional [json
schema](http://json-schema.org/). The schema is merged using [JSON Merge
Patch](https://tools.ietf.org/html/rfc7396).

```ts
import { definePlugin } from "html-validate";

export default definePlugin({
  elementSchema: {
    // properties are added to elements metadata
    properties: {
      myProperty: {
        type: "string",
        enum: ["foo", "bar"],
      },
      myOtherProperty: {
        // reuse shared types
        $ref: "#/definitions/myReferenceType",
      },
    },

    // definitions are added to shared types
    definitions: {
      myReferenceType: {
        type: "number",
      },
    },
  },
});
```

Extended metadata can be entered into metadata for any element and access by any
rule similar to regular metadata. Given the schema above any element may contain
the new property `myProperty`:

```js
export default {
  myElement: {
    myProperty: "foo",
  },
};
```

Rules may then access `myProperty` using `node.meta.myProperty`:

```ts nocompile
const meta = event.target.meta;
switch (meta.myProperty) {
  case "foo": /* ... */
  case "bar": /* ... */
  default: /* ... */
}
```

### Copyable metadata

Plugins leveraging usage of `loadMeta` for advanced handling of metadata loading must explicitly mark the copyable properties as `copyable`:

```ts
import { definePlugin } from "html-validate";

export default definePlugin({
  elementSchema: {
    properties: {
      foo: {
        copyable: true,
      },
      bar: {
        copyable: false,
      },
    },
  },
});
```

Given these two properties only `foo` will be copied (loaded) onto the element when using `loadMeta`:

```json
{
  "my-element": {
    "foo": "original",
    "bar": "original"
  },
  "my-element:slot": {
    "foo": "overwritten",
    "bar": "overwritten"
  }
}
```

```ts
import { HtmlElement, ProcessElementContext } from "html-validate";

export function processElement(this: ProcessElementContext, node: HtmlElement): void {
  const meta = this.getMetaFor("my-element:slot");
  if (meta) {
    node.loadMeta(meta);
  }
}
```

The resulting metadata will now be:

```json
{
  "foo": "overwritten",
  "bar": "original"
}
```

### Version compatibility

- Since: 5.0.0

Plugins can use the `compatibilityCheck` helper to verify the library version is compatible.

```typescript fake-require
import { compatibilityCheck } from "html-validate";
import pkg from "./package.json";

const range = pkg.peerDependencies["html-validate"];

compatibilityCheck(pkg.name, range);
```

The helper will write a friendly notice on console if the version is not supported.

If you want the error to be fatal you it returns `false` if the version is not supported.
Additionally you can pass the `silent` option if you want to disable output`

```ts
import { compatibilityCheck } from "html-validate";

const pkg = { name: "mock-name" };
const range = "^1";

/* --- */

if (!compatibilityCheck(pkg.name, range, { silent: true })) {
  /* handle incompatible version */
}
```
