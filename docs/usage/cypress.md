---
docType: content
title: Cypress plugin
---

# Cypress plugin

To validate browser source from cypress:

    npm install --save-dev cypress-html-validate

See [cypress-html-validate][npm] for details.

[npm]: https://www.npmjs.com/package/cypress-html-validate

## Usage

In `cypress/plugins/index.js`:

```js
const htmlvalidate = require("cypress-html-validate/dist/plugin");

module.exports = (on) => {
  htmlvalidate.install(on);
};
```

`cypress/support/index.js`:

```js
import "cypress-html-validate/dist/commands";
```

In specs:

```js
it("should be valid", () => {
  cy.visit("/my-page.html");
  cy.htmlvalidate();
});
```

## Configuration

### Global configuration (accross all specs)

`html-validate` configuration can be passed in `cypress/plugins/index.js`:

```js
htmlvalidate.install(on, {
  rules: {
    foo: "error",
  },
});
```

### Local configuration (for one spec)

`html-validate` configuration can be passed in the function call within a spec:

```js
cy.htmlvalidate({
  rules: {
    "prefer-native-element": [
      "error",
      {
        exclude: ["button"],
      },
    ],
  },
});
```

It is also possible to add both configuration & options in the function call:

```js
cy.htmlvalidate(
  {
    rules: {
      "prefer-native-element": [
        "error",
        {
          exclude: ["button"],
        },
      ],
    },
  },
  {
    exclude: ["form"],
  }
);
```
