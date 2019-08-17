@ngdoc content
@module dev
@name Writing plugins
@description

# Writing plugins

A plugin must expose a single object implementing the following interface:

```typescript
export interface Plugin {
  /**
   * Name of the plugin.
   *
   * Read-only property set by config.
   */
  name: string;

  /**
   * Initialization callback.
   *
   * Called once per plugin during initialization.
   */
  init?: () => void;

  /**
   * Setup callback.
   *
   * Called once per source after engine is initialized.
   *
   * @param source The source about to be validated. Readonly.
   * @param eventhandler Eventhandler from parser. Can be used to listen for
   * parser events.
   */
  setup?: (source: Source, eventhandler: EventHandler) => void;

  /**
   * Configuration presets.
   *
   * Each key should be the unprefixed name which a configuration later can
   * access using `${plugin}:${key}`, e.g. if a plugin named "my-plugin" exposes
   * a preset named "foobar" it can be accessed using `"extends":
   * ["my-plugin:foobar"]`.
   */
  configs: { [key: string]: ConfigData };

  /**
   * List of new rules present.
   */
  rules: { [key: string]: RuleConstructor };

  /**
   * Extend metadata validation schema.
   */
  elementSchema?: SchemaValidationPatch;
}
```

E.g. a simple plugin with additional rules might look like:

```js
module.exports = {
  rules: {
    "custom/my-rule": require("./rules/my-rule"),
  },
};
```

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

The callback may not manpiulate the source object.

## Configuration presets

Plugins can create configuration presets similar to a shared configuration:

```js
module.exports = {
  configs: {
    recommended: {
      "my-rule": "error",
    },
  },
};
```

Users may then extend the preset using `plugin:name`, e.g.:

```js
{
  "extends": [
    "my-plugin:recommended"
  ]
}
```

## Rules

See [writing rules](/dev/writing-rules.html) for details on how to write a rules.

To expose rules in the plugin use the `plugin` field. Each plugin should use a
unique prefix for each rule.

```js
const MyRule = require("./rules/my-rule.js");
const AnotherRule = require("./rules/another-rule.js");

module.exports = {
  rules: {
    "my-prefix/my-rule": MyRule,
    "my-prefix/another-rule": AnotherRule,
  },
};
```

This makes the rules accessable as usual when configuring in
`.htmlvalidate.json`:

```js
{
  "plugins": [
    "my-fancy-plugin",
  ],
  "rules": {
    "my-prefix/my-rule": "error"
  },
}
```

## Extend metadata

Plugins can extend the available [element metadata](/usage/elements.html) by
setting `elementSchema` with an additional [json
schema](http://json-schema.org/). The schema is merged using [JSON Merge
Patch](https://tools.ietf.org/html/rfc7396).

```js
module.exports = {
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
    defintions: {
      myReferenceType: {
        type: "number",
      },
    },
  },
};
```

Extended metadata can be entered into metadata for any element and access by any
rule similar to regular metadata. Given the schema above any element may contain
the new property `myProperty`:

```js
module.exports = {
  myElement: {
    myProperty: "foo",
  },
};
```

Rules may then access `myProperty` using `node.meta.myProperty`:

```typescript
const meta = event.target.meta;
switch (meta.myProperty) {
  case "foo": /* ... */
  case "bar": /* ... */
  default: /* ... */
}
```
