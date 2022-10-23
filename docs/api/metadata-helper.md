---
docType: content
title: API - MetadataHelper
id: api:MetadataHelper
name: MetadataHelper
---

# `MetadataHelper`

```ts
export interface MetadataHelper {
  allowedIfAttributeIsPresent(...attr: string[]): MetaAttributeAllowedCallback;
  allowedIfAttributeIsAbsent(...attr: string[]): MetaAttributeAllowedCallback;
  allowedIfAttributeHasValue(
    attr: string,
    value: string[],
    options?: { defaultValue?: string | null }
  ): MetaAttributeAllowedCallback;
}
```

These functions are exported as `metadataHelper` and can be used when writing element metadata:

```js
const { metadataHelper } = require("html-validate");
const { allowedIfAttributeIsPresent } = metadataHelper;
```

## `allowedIfAttributeIsPresent`

Returns an error if another attribute is omitted, i.e. it requires another attribute to be present to pass.

```js
const { defineMetadata, metadataHelper } = require("html-validate");
const { allowedIfAttributeIsPresent } = metadataHelper;

module.exports = defineMetadata({
  "custom-element": {
    attributes: {
      foo: {
        /* will be allowed if bar or baz is also present */
        allowed: allowedIfAttributeIsPresent("bar", "baz"),
      },
    },
  },
});
```

## `allowedIfAttributeIsAbsent`

Returns an error if another attribute is present, i.e. it requires another attribute to be omitted to pass.

```js
const { defineMetadata, metadataHelper } = require("html-validate");
const { allowedIfAttributeIsPresent } = metadataHelper;

module.exports = defineMetadata({
  "custom-element": {
    attributes: {
      foo: {
        /* will be allowed only if both bar or baz is omitted */
        allowed: allowedIfAttributeIsAbsent("bar", "baz"),
      },
    },
  },
});
```

## `allowedIfAttributeHasValue`

Returns an error if another attribute does not have one of the listed values.

```js
const { defineMetadata, metadataHelper } = require("html-validate");
const { allowedIfAttributeIsPresent } = metadataHelper;

module.exports = defineMetadata({
  "custom-element": {
    attributes: {
      foo: {
        /* will be allowed only if "type" attribute is set to "foo" or "bar", with the default being "foo" */
        allowed: allowedIfAttributeHasValue("type", ["foo", "bar"], { defaultValue: "foo" }),
      },
    },
  },
});
```
