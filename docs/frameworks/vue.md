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

## Using [`nuxt`](https://nuxtjs.org/)

    yarn add --dev @nuxtjs/html-validator

Then add the Nuxt module to your `nuxt.config.js`:

```js
export default {
  buildModules: ["@nuxtjs/html-validator"],
  htmlValidator: {
    options: {
      // you can pass options directly to `html-validate`
    },
  },
};
```

You can find more details in [the documentation](https://html-validator.nuxtjs.org/).

The module will then validate all server-rendered and server-generated HTML with `html-validate`.

## Manual configuration

    npm install html-validate-vue

[html-validate-vue](https://www.npmjs.com/package/html-validate-vue) is needed
to transform `.vue` single file components and includes elements metadata
overrides for Vue.js.

Configure with:

```json config
{
  "plugins": ["html-validate-vue"],
  "extends": ["html-validate:recommended", "html-validate-vue:recommended"],
  "elements": ["html5"],
  "transform": {
    "^.*\\.vue$": "html-validate-vue"
  }
}
```
