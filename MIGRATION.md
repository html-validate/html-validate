# Migration guide

## Upgrading to v9

### API changes {#v9-api-changes}

#### Configuration errors {v9-config-deferred}

In previous versions the `HtmlValidate` constructor would load the configuration directly and thus triggering configuration errors to occur.
In V9 the configuration loading is deferred until validation occurs.

Previous:

```ts
import { HtmlValidate } from "html-validate";

/* --- */

let htmlvalidate;
try {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  htmlvalidate = new HtmlValidate({
    /* invalid configuration */
  });
} catch (err) {
  /* ... */
}
```

In V9 the above will not throw an exception but rather when later using the configuration it will, e.g. using any of the following will throw an exception:

- `validateString(..)`
- `validateFilename(..)`
- `validateSource(..)`
- `getConfigFor(..)`

etc.

#### Config `fromFile(..)` and `fromObject(..)` async {#v9-config-async}

The `Config.fromFile(..)` and `Config.fromObject(..)` will return a `Promise` when used with an async `ConfigLoader` or `Resolver`.

To future-proof your code if using the `Config` class directly it is recommended to always `await` the result.

```diff
 const resolvers = [staticResolver()];
-const config = Config.fromObject(resolvers, {
+const config = await Config.fromObject(resolvers, {
   /* configuration */
 });
```

If you must use synchronous code only it is up to you to ensure everything the configuration requires (plugins, loaders, resolvers) works in a synchronous manner.

#### ConfigLoader async {#v9-configloader-async}

All methods of `ConfigLoader` can optionally return a `Promise` for asynchronous operation.
For most use-cases this will not require any changes.

If you are simply passing in the configuration to the `HtmlValidate` constructor no action needs to be taken.

```ts
import { FileSystemConfigLoader, HtmlValidate } from "html-validate";

/* --- */

const loader = new FileSystemConfigLoader();
const htmlvalidate = new HtmlValidate(loader); // no changes needed!
htmlvalidate.validateString("..");
```

If you use a loader in other ways e.g. reading the resulting configuration, it is recommended to always `await` the result.

```diff
const loader = new FileSystemConfigLoader();
-const config = loader.getConfigFor("my-file.html");
+const config = await loader.getConfigFor("my-file.html");
```

If you must use synchronous code only it is up to you to ensure everything the configuration requires works in a synchronous manner.

Custom loaders will continue to work but can be rewritten to return a promise, for instance:

```diff
 class MyCustomLoader extends ConfigLoader {
-  public getConfigFor(filePath: string): ResolvedConfig {
+  public async getConfigFor(filePath: string): Promise<ResolvedConfig> {
     /* ... */
   }
 }
```

Using an asynchronous loader with any synchronous API such as `HtmlValidate.validateStringSync()` or `HtmlValidate.getConfigForSync()` results in an error.

#### ConfigLoader `globalConfig` property removed {#v9-configloader-globalconfig}

The `ConfigLoader.globalConfig` property has been removed and replaced with `getGlobalConfig()` and `getGlobalConfigSync()`.

```diff
-const merged = this.globalConfig.merge(this.resolvers, override);
+const globalConfig = await this.getGlobalConfig();
+const merged = globalConfig.merge(this.resolvers, override);
```

#### `Config.init()` method removed {#v9-config-init}

The redundant and deprecated `Config.init()` method has been removed.

Remove any calls to the method:

```diff
 const config = Config.fromObject({ /* ... */ });
-config.init();
```

#### Test utils

All functions from `html-validate/test-utils` now returns a `Promise`:

- `transformFile`
- `transformSource`
- `transformString`

If you are them to write unit tests for custom transfomers you need to resolve the returned promise:

```diff
 import { transformSource } from "html-validate/test-utils";

-const result = transformSource(transformer, source);
+const result = await transformSource(transformer, source);
```

#### Transformers {#v9-transformers}

Transformers may now return a `Promise` for asynchronous result.
For most part there is no code changes required but if you use the `this.chain(..)` method to support chains you need to ensure you can handle that the next transformer may have returned a `Promise`.

If you used a generator function and `yield*` replace with a simple return:

```diff
-yield* this.chain(..);
+return this.chain(..);
```

If you postprocess the result you must either `await` the result or test if the result is a `Promise`.

When using TypeScript the return signature must change:

```diff
-function myTransformer(this: TransformContext, source: Source): Iterable<Source> {
+function myTransformer(this: TransformContext, source: Source): Iterable<Source> | Promise<Iterable<Source>> {
```

## Upgrading to v8

### Dependency changes {#v8-dependency-changes}

- Minimum required NodeJS version is v16.
- Minimum required Jest version is v27.

### All users {#v8-all-users}

- The `void` rule has been removed after being deprecated a long time, it is replaced with the separate {@link rule:void-content}, {@link rule:void-style} and {@link rule:no-self-closing} rules.
- Deprecated severity alias `disabled` removed. If you use this in your configuration you need to update it to `off`.

```diff
 {
   "rules": {
-    "my-awesome-rule": "disabled"
+    "my-awesome-rule": "off"
   }
 }
```

### API changes {#v8-api-changes}

#### Promise-based API {#v8-promise-based-api}

The `HtmlValidate` class now has a `Promise` based API where most methods return a `Promise`.
The old synchronous methods has been renamed to `*Sync(..)`, .e.g `validateString(..)` is now `validateStringSync(..)`.

To migrate either use the new asynchronous API with `await`:

```diff
-const result = htmlvalidate.validateFile("my-awesome-file.html");
+const result = await htmlvalidate.validateFile("my-awesome-file.html");
```

or use the synchronous API:

```diff
-const result = htmlvalidate.validateFile("my-awesome-file.html");
+const result = htmlvalidate.validateFileSync("my-awesome-file.html");
```

For unittesting with Jest it is recommended to make the entire test-case async (but the matchers will handle passing in a `Promise` as well):

```diff
-it("my awesome test", () => {
+it("my awesome test", async () => {
   const htmlvalidate = new HtmlValidate();
-  const report = htmlvalidate.validateString("...");
+  const report = await htmlvalidate.validateString("...");
   expect(report).toMatchCodeFrame();
});
```

### `@html-validate/plugin-utils`

The `TemplateExtractor` class has been moved to the `@html-validate/plugin-utils` package.
This change only affects API users who use the `TemplateExtractor` class, typically this is only used when writing plugins.

The rationale for this is to cut down on the API surface and the number of required dependencies.

### `getContextualDocumentation` replaces `getRuleDocumentation`

A new `getContextualDocumentation` replaces the now deprecated `getRuleDocumentation` method.
The context parameter to `getRuleDocumentation` is now required and must not be omitted.

For rule authors this means you can now rely on the `context` parameter being set in the `documentation` callback.

For IDE integration and toolchain authors this means you should migrate to use `getContextualDocumentation` as soon as possible or if you are continuing to use `getRuleDocumentation` you are now required to pass the `config` and `context` field from the reported message.

### Configuration API changes {#v8-configuration-api-changes}

Many breaking changes has been introduced to the configuration API.

- `ConfigLoader` must return `ResolvedConfig`

In the simplest case this only requires to call `Config.resolve()`:

```diff
-return config;
+return config.resolve();
```

A resolved configuration cannot further reference any new files to extend, plugins to load, etc.

- Add `Resolver` classes as a mean to separate `fs` from browser build

This change affect API users only, specifically API users directly using the `Config` class.
Additionally when using the `StaticConfigLoader` no modules will be resolved using `require(..)` by default any longer.
If you want to resolve modules using `require` you must use the {@link dev/using-api#resolvers `NodeJSResolver`}.

Instructions for running in a browser is also updated.

To create a `Config` instance you must now pass in a `Resolver` (single or array):

```diff
+const resolvers = [ /* ... */ ];
-const config = new Config( /* ... */ );
+const config = new Config(resolvers, /* ... */ );
```

This applies to calls to `Config.fromObject(..)` as well.

The default resolvers for `StaticConfigLoader` is `StaticResolver` and for `FileSystemConfigLoader` is `NodeJSResolver`.
Both can optionally take a new set of resolvers (including custom ones).

Each resolver will, in order, try to load things by name.
For instance, when using the `NodeJSResolver` it uses `require(..)` to load new items.

- `StaticResolver` - uses a predefined set of items.
- `NodeJSResolver` - uses `require(..)`

* `ConfigFactory` removed

The `ConfigFactory` parameter to `ConfigLoader` (and its child classes `StaticConfigLoader` and `FileSystemConfigLoader`) has been removed.
No replacement.
If you are using this you are probably better off implementing a fully custom loader later returning a `ResolvedConfig`.

## Upgrading to v7

### Dependency changes {#v7-dependency-changes}

- Minimum required NodeJS version is v14.

## Upgrading to v6

- CLI users: No required changes but if custom element metadata is present it can benefit from upgrading format.
- API users: Breaking changes!

### Configuration changes

The format for specifying attribute metadata has changed.
This will probably not affect most users but if you have custom element metadata (e.g. `elements.json`) and specify attribute restrictions you should migrate to the new format.

If you do not use custom element metadata you can safely upgrade to this version without any changes.

If you need to maintain backwards compatibility with older versions of `html-validate` you can safely hold of the migration (e.g. you publish a component framework with bundled element metadata and don't want to force an update for end users).
The old format is deprecated but will continue to be supported for now.

Previously the attributes was specified as an array of possible values (strings or regular expressions).
Boolean attributes was specified as `[]` and when value could be omitted it used the magic value `[""]`.

```jsonc
{
  "my-custom-input": {
    "attributes": {
      /* enumeration: must have one of the specified values */
      "type": ["text", "email", "tel"],

      /* boolean: should not have a value */
      "disabled": [],

      /* allow omitting value, e.g. it can be set as a boolean or it should be "true" or "false" */
      "multiline": ["", "true", "false"],
    },
  },
}
```

To migrate the array is changed to an object with the properties `enum`, `boolean` and `omit`:

```diff
 {
   "my-custom-input": {
     "attributes": {
       /* enumeration: must have one of the specified values */
-      "type": ["text", "email", "tel"],
+      "type": {
+        "enum": ["text", "email", "tel"]
+      },

       /* boolean: should not have a value */
-      "disabled": [],
+      "disabled": {
+        "boolean": true
+      },

       /* allow omitting value, e.g. it can be set as a boolean or it should be "true" or "false" */
-      "multiline": ["", "true", "false"]
+      "multiline": {
+        "omit": true,
+        "enum": ["true", "false"] // the value "" is no longer specified in the enumeration
+      }
     }
   }
 }
```

The properties `requiredAttributes` and `deprecatedAttributes` have been integrated into the same object:

```diff
 {
   "my-custom-input": {
-    "requiredAttributes": ["type"],
-    "deprecatedAttributes": ["autocorrect"]
+    "attributes": {
+      "type": {
+        "required": true
+      },
+      "autocorrect": {
+        "deprecated": true
+      }
+    }
   }
 }
```

It is perfectly valid to specify attributes as an empty object which is used to signal that an attribute is exists.
When [#68](https://gitlab.com/html-validate/html-validate/-/issues/68) (validate know attributes) is implemented it will be required to list all known attributes but for now no validation will happen without any properties set.

```jsonc
{
  "my-custom-input": {
    "attributes": {
      /* signal that the "foobar" attribute exists but no validation will occur */
      "foobar": {},
    },
  },
}
```

### API changes

If you use `MetaElement` to query attribute metadata you must use the new object.
Typically this should only be if you have a custom rule dealing with attributes.
While the old format is supported in userland internally it is converted to the new format.

For instance, given a rule such as:

```ts nocompile
function myCustomRule(node: DOMNode, attr: Attribute, rule: string[]): void {
  /* ... */
}

const meta = node.meta.attributes;
for (const attr of node.attributes) {
  if (meta[attr.key]) {
    myCustomRule(node, attr, meta[attr.key]);
  }
}
```

The signature of the function must be changed to:

```diff
-function myCustomRule(node: DOMNode, attr: Attribute, rule: string[]): void {
+function myCustomRule(node: DOMNode, attr: Attribute, rule: MetaAttribute): void {
   /* ... */
}
```

If you want backwards compatibility you must handle both `string[]` and `MetaAttribute`, `Array.isArray` can be used to distinguish between the two:

```ts nocompile
function myCustomRule(node: DOMNode, attr: Attribute, rule: string[] | MetaAttribute): void {
  if (Array.isArray(rule)) {
    /* legacy code path */
  } else {
    /* modern code path */
  }
}
```

If the rule used logic to determine if the attribute is boolean it must be changed to use the `boolean` property:

```diff
-const isBoolean = rule.length === 0;
+const isBoolean = rule.boolean;
```

If the rule used logic to determine if the attribute value can be omitted it must be changed to use the `omitted` property:

```diff
-const canOmit = rule.includes("");
+const canOmit = rule.omit;
```

The list of allowed values are must be read from the `enum` property but rules must take care to ensure they work even if `enum` is not set (`undefined`):

```diff
-const valid = rule.includes(attr.value);
+const valid = !rule.enum || rule.enum.includes(attr.value);
```

If you used `requiredAttributes` or `deprecatedAttributes` these have now been integrated into the same object:

```diff
-const isDeprecated = meta.deprecatedAttributes.includes(attr.key);
+const isDeprecated = meta.attribute[attr.key]?.deprecated;
```

### `ConfigReadyEvent`

**Only affects API users.**

If you have a rule or plugin listening to the `ConfigReadyEvent` event the datatype of the `config` property has changed from `ConfigData` to `ResolvedConfig`.
For most part it contains the same information but is normalized, for instance rules are now always passed as `Record<RuleID, [Severity, Options]>`.
Configured transformers, plugins etc are resolved instances and fields suchs as `root` and `extends` will never be present.

### `StaticConfigLoader`

**Only affects API users.**

The default configuration loader has changed from {@link dev/using-api#filesystemconfigloader `FileSystemConfigLoader`} to {@link dev/using-api#staticconfigloader `StaticConfigLoader`}, i.e. the directory traversal looking for `.htmlvalidate.json` configuration files must now be explicitly enabled.

This will reduce the dependency on the NodeJS `fs` module and make it easier to use the library in browsers.

To restore the previous behaviour you must now enable `FileSystemConfigLoader`:

```diff
 import { HtmlValidate, FileSystemConfigLoader } from "html-validate";

-const htmlvalidate = new HtmlValidate();
+const loader = new FileSystemConfigLoader();
+const htmlvalidate = new HtmlValidate(loader);
```

If you pass configuration to the constructor you now pass it to the loader instead:

```diff
 import { HtmlValidate, FileSystemConfigLoader } from "html-validate";

-const htmlvalidate = new HtmlValidate({ ... });
+const loader = new FileSystemConfigLoader({ ... });
+const htmlvalidate = new HtmlValidate(loader);
```

If you use the `root` property as a workaround for the directory traversal you can now drop the workaround and rely on `StaticConfigLoader`:

```diff
 import { HtmlValidate } from "html-validate";

-const htmlvalidate = new HtmlValidate({
-  root: true,
-});
+const htmlvalidate = new HtmlValidate();
```

The CLI class is not affected as it will enable `FileSystemConfigLoader` automatically, so the following code will continue to work as expected:

```ts nocompile
const cli = new CLI();
const htmlvalidate = cli.getValidator();
```
