---
docType: content
title: Usage with Vue.js
---

# Usage with Vue.js

## Using `vue-cli-service`

    vue add html-validate

Adds the required libraries and preconfigures `.vue` transformations. A
configuration is dropped in the project root directory with recommended
configuration for Vue.js.

Adds a new CLI service command:

    vue-cli-service html-validate

Validates all `.html` and `.vue` files in the `src` folder. Patterns can be
overwritten by passing them as positional arguments.

## Manual configuration

    npm install html-validate-vue

[html-validate-vue](https://www.npmjs.com/package/html-validate-vue) is needed
to transform `.vue` single file components and includes elements metadata
overrides for Vue.js.

Configure with:

```js
{
  "elements": ["html5", "html-validate-vue/elements"],
  "transform": {
    "^.*\\.vue$": "html-validate-vue"
  }
}
```
