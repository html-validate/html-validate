---
docType: content
title: VS Code Extension
nav: userguide
---

# VS Code Extension

To get validation directly in VS Code use the [HTML-Validate extension](https://marketplace.visualstudio.com/items?itemName=html-validate.vscode-html-validate):

    ext install html-validate.vscode-html-validate

The extension is also available on the [Open VSX Registry](https://open-vsx.org): [HTML-Validate](https://open-vsx.org/extension/html-validate/vscode-html-validate)

## Usage

The extension can work in three modes:

- With HTML-Validate installed in the local project.
- With HTML-Validate installed globally on the users system.
- Using a bundled version of HTML-Validate.

It is recommended to add HTML-Validate to the local project to get consistent results over time and between different developers working on a single project.
When using a global or bundled version you might get different warnings and errors as the version changes.

When using the bundled version only pure `.html` files are supported (e.g. no Vue, Markdown etc).

### Configuration

Configuration works similar to the CLI tool: create a `.htmlvalidate.json` file with the configuration you want.

```json config
{
  "extends": ["html-validate:recommended"]
}
```

Learn more about {@link getting-started getting started} with HTML-Validate.

Out-of-the-box only pure `.html` files will be validated.
See further below for instructions for additional languages.

### Settings

The extension is by default enabled for the following languages:

- `html`
- `javascript` (requires a configured transformer)
- `markdown` (requires a configured transformer)
- `vue` (requires a configured transformer)
- `vue-html` (requires a configured transformer)

This can be overrriden with the `html-validate.validate` setting.

## Languages

### Markdown

To validate HTML in markdown code fences use the [html-validate-markdown][npm:html-validate-markdown] plugin:

    npm install --save-dev html-validate html-validate-markdown

Configure with:

```diff
 {
   "extends": ["html-validate:recommended"],
+  "transform": {
+    "^.*\\.md$": "html-validate-markdown"
+  }
 }
```

See plugin for additional instructions and configuration.

[npm:html-validate-markdown]: https://www.npmjs.com/package/html-validate-markdown

### Vue

To validate template in Vue SFC use the [html-validate-vue][npm:html-validate-vue] plugin:

    npm install --save-dev html-validate html-validate-vue

Configure with:

```diff
 {
-  "extends": ["html-validate:recommended"],
+  "plugins": ["html-validate-vue"],
+  "extends": ["html-validate:recommended", "html-validate-vue:recommended"],
+  "transform": {
+    "^.*\\.vue$": "html-validate-vue"
+  }
 }
```

See {@link vue plugin documentation} for additional instructions and configuration.

[npm:html-validate-vue]: https://www.npmjs.com/package/html-validate-vue
