---
docType: content
title: Cypress plugin
nav: userguide
# Note: this file relies heavily on the typescript declarations in
# `docs/examples/types/cypress*`, if you find yourself getting compilation
# errors it could be because the declarations are not complete.
---

# Cypress plugin

It automatically fetches the active source markup from the browser and validates, failing the test if any validation errors is encountered.

## Installation

    npm install --save-dev html-validate cypress-html-validate

Make sure you install both `html-validate` and the plugin `cypress-html-validate`.
With NPM 7 or later it will be satisfied by the peer dependency but for a more consistent and deterministic experience it is suggested to include both as dependencies for your project.

## Usage

In `cypress.config.[jt]s`:

```ts
import { defineConfig } from "cypress";
import htmlvalidate from "cypress-html-validate/plugin";

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      htmlvalidate.install(on);
    },
  },
});
```

In `cypress/support/e2e.[jt]s` and/or `cypress/support/component.[jt]s`:

```ts
import "cypress-html-validate/commands";
```

In specs:

```ts nocompile
it("should be valid", () => {
  cy.visit("/my-page.html");
  cy.htmlvalidate();
});
```

To automatically run after each test you can use `afterEach` either in the spec file or in `cypress/support/index.js`:

```ts nocompile
afterEach(() => {
  cy.htmlvalidate();
});
```

## Configuration

### Global configuration (across all specs)

`html-validate` and the plugin can configured globally in `cypress/plugins/index.js`:

```ts
import { defineConfig } from "cypress";
import { ConfigData } from "html-validate";
import htmlvalidate, { CypressHtmlValidateOptions } from "cypress-html-validate/plugin";

/* html-validate configuration */
const config: ConfigData = {
  rules: {
    foo: "error",
  },
};

/* plugin options */
const options: Partial<CypressHtmlValidateOptions> = {
  exclude: [],
  include: [],
  formatter(messages) {
    console.log(messages);
  },
};

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      htmlvalidate.install(on, config, options);
    },
  },
});
```

The default configuration extends `html-validate:recommended` and `html-validate:document` (see {@link rules/presets presets}).
This can be overridden by explictly specifying `extends: []`:

```ts nocompile
import htmlvalidate from "cypress-html-validate/plugin";

/* --- */

htmlvalidate.install(on, {
  extends: [],
});
```

See {@link usage#configuration full list of configuration options}.

### Local configuration (for one occurrence)

If you want to override per call you can pass configuration and/or options directly to the function:

```ts nocompile
cy.htmlvalidate([config], [options]);
```

```ts nocompile
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
  },
);
```

### Element metadata

Element metadata can be overriden the same way as with the CLI tool by adding a custom inline config or using a separate file.

For instance, to enforce the attribute of `srcset` being required on `img` elements:

```ts
import { defineConfig } from "cypress";
import { ConfigData } from "html-validate";
import htmlvalidate from "cypress-html-validate/plugin";

const config: ConfigData = {
  elements: [
    "html5",
    {
      img: {
        attributes: {
          srcset: {
            required: true,
          },
        },
      },
    },
  ],
};

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      htmlvalidate.install(on, config);
    },
  },
});
```

## Options

### `exclude`

- type: `string[] | null`
- default: `[]`

A list of selectors to ignore errors from.
Any errors from the elements or any descendant will be ignored.

### `include`

- type: `string[] | null`
- default: `[]`

A list of selectors to include errors from.
If this is set to non-empty array only errors from elements or any descendants will be included.

### `formatter`

- type: `(messages: ElementMessage[]): void`

Custom formatter/reporter for detected errors.
Default uses `console.table(..)` to log to console.
Set to `null` to disable.
