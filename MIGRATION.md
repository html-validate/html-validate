# Migration guide

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
      "multiline": ["", "true", "false"]
    }
  }
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
      "foobar": {}
    }
  }
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
