---
docType: content
title: Getting started
name: getting-started
nav: userguide
---

# Getting started

HTML-validate is an offline HTML5 validator.

## Installation

Install using `npm`:

    npm install --save-dev html-validate

Create a configuration file:

```json config
{
  "extends": ["html-validate:recommended"]
}
```

Run with:

    npm exec html-validate yourfile.html

::: tip

If you use [Prettier](https://prettier.io/) code formatter add the `html-validate:prettier` preset as well to avoid style related rules clashing with Prettier.

Learn more about {@link presets configuration presets}.

:::

## Configuration

Configuration can be added to:

- `.htmlvalidate.js`
- `.htmlvalidate.cjs`
- `.htmlvalidate.mjs`
- `.htmlvalidate.json`

For `json` the JSON schema `https://html-validate.org/schemas/config.json` can optionally be used:

```jsonc
{
  "$schema": "https://html-validate.org/schemas/config.json",
  "extends": ["html-validate:recommended"],
}
```

For javascript configuration files the `defineConfig(..)` helper can optionally be used to assist the IDE with type-checking and documentation:

```js
import { defineConfig } from "html-validate";

export default defineConfig({
  extends: ["html-validate:recommended"],
});
```

Configuration files will be searched from the target file and up until either no more parent folders exist or `"root": true` is found.

### `extends`

Configuration can be extended from bundled preset or shareable configurations.

```jsonc config
{
  "plugins": ["my-plugin"],
  "extends": [
    /* bundled preset */
    "html-validate:recommended",

    /* npm package */
    "my-npm-package",

    /* preset "recommended" from "my-plugin" */
    "my-plugin:recommended",

    /* local file */
    "./file",
  ],
}
```

A list of bundled presets is available at the {@link rules/presets preset list}.
By default `html-validate:recommended` is used.

When using NPM packages or files each must be resolvable with `import(..)` and default export a valid configuration object.
Plugins may create {@link writing-plugins#configuration-presets configuration presets} by exposing one or more preset in the plugin declaration.

### `rules`

```json config
{
  "rules": {
    "some-rules": "severity",
    "other-rule": ["severity", { "option": true }]
  }
}
```

Severity can be one of:

- `"error"` (or `2`) to report an error.
- `"warn"` (or `1`) to report a warning.
- `"off"` (or `0`) to disable the rule.

Some options takes optional parameters when using the form `["severity", OPTIONS]`.

See {@link rules} for a list of all built-in rules and options.

### `elements`

For proper validation some metadata for each element is required, detailing in
which context it can be used, allowed/disallowed attributes, etc. If `elements`
is not specified it defaults to `["html5"]` which is a bundled collection for
all HTML5 elements.

```jsonc config
{
  "elements": [
    "html5",
    "my-npm-package",
    "./file.json",
    {
      /* inline metadata */
    },
  ],
}
```

Each entry will try to load metadata from (search in following order):

1. Named bundled metadata.
2. NPM package with the same name.
3. A local file, json or js, resolvable by `import(..)`. Path is relative to the configuration file.

An object can also be passed with inline metadata but it is highly recommended to write it to a separate file.

See [elements metadata](/usage/elements.html) for details about writing your own metadata.

### `plugins`

List of extra plugins to load.
Plugins can contain additional rules, predefined configurations and transformers.

Can be either a NPM package or relative path to a local file, i.e. when writing custom rules inside the repository.
Must be resolvable by `import(..)`.

See {@link writing-plugins writing plugins} for details about creating your own plugins.

```json config
{
  "plugins": ["my-awesome-plugin", "./local-plugin"]
}
```

Since version 7.17.0, if you are using javascript configuration or API you can also import or define plugins inline:

```js
import { defineConfig } from "html-validate";

export default defineConfig({
  plugins: [
    {
      name: "my-awesome-plugin",
      /* ... */
    },
  ],
});
```

### `transform`

- type: `Record<string, string | function>`
- default: `{}`

Transform input files to extract HTML chunks, e.g. extract templates from javascript sources.
See [transformers](/usage/transformers.html) for details.

```json config
{
  "transform": {
    "^.*\\.vue$": "html-validate-vue"
  }
}
```

This will transform `*.vue` with the `html-validate-vue` NPM package.

Can be set to:

- The name of an NPM package with a default exported function.
- The name of a transformer from a plugin.
- A relative path to use a local script (use `<rootDir>` to refer to the path to `package.json`, e.g. `<rootDir>/my-transformer.js`)
- A function (in a javascript-based configuration)

### `root`

By default, configuration is search in the file structure until the root directory (typically `/`) is found:

- `/home/user/project/src/.htmlvalidate.{js,cjs,mjs,json}`
- `/home/user/project/.htmlvalidate.{js,cjs,mjs,json}`
- `/home/user/.htmlvalidate.{js,cjs,mjs,json}`
- `/home/.htmlvalidate.{js,cjs,mjs,json}`
- `/.htmlvalidate.{js,cjs,mjs,json}`

By setting the `root` property to `true` the search is stopped. This can be used
to prevent searching from outside the project directory or to use a specific
configuration for a specific directory without loading project configuration.

For instance, if `/home/project/.htmlvalidate.json` contains:

```json config
{
  "root": true
}
```

Only the following files would be searched:

- `/home/user/project/src/.htmlvalidate.{js,cjs,mjs,json}`
- `/home/user/project/.htmlvalidate.{js,cjs,mjs,json}`

This also affects CLI `--config` and the API, e.g. when using `--config` with a
configuration using `"root": true` will prevent any additional files to be
loaded.

## Inline configuration

Configuration can be changed inline using directive of the form:

    <!-- html-validate-ACTION OPTIONS -- COMMENT -->

alternatively:

    <!-- [html-validate-ACTION OPTIONS -- COMMENT] -->

`ACTION` is an action such as `enable`, `disable` etc and `OPTIONS` is arguments to the action.
Comment is optional but encouraged.

::: info Optional brackets
Versions earlier than %version% required brackets around the directive:

    <!-- [html-validate-ACTION OPTIONS -- COMMENT] -->

The brackets are now optional, either syntax can be used.
:::

Multiple rules can be enabled/disabled at once by using a comma-separated list:

    <!-- html-validate-disable-next void-style, deprecated -- disable both rules -->

Comments can be entered using both `--` and `:` as delimiter:

<validate name="directive-commend">
	<!-- html-validate-disable-next deprecated -- justification for disabling -->
	<blink>Blinking text</blink>
	<!-- html-validate-disable-next deprecated: justification for disabling -->
	<blink>Blinking text</blink>
</validate>

### `enable`

    <!-- html-validate-enable element-permitted-content -->

Enables a rule. If the severity is set to `off` it will be raised to `error`,
i.e a previously disabled warning will remain a warning after enabling it again.

### `disable`

    <!-- html-validate-disable deprecated -->

Disable a rule for the rest of the file or until re-enabled using `enable` directive.

### `disable-block`

    <!-- html-validate-disable-block attribute-allowed-values -->

Disables a rule for a block of elements.
All siblings and descendants following the directive will not trigger any errors.

<validate name="disable-block-button-type">
  <div>
    <button type="foo">Invalid button</button>
    <!-- html-validate-disable-block attribute-allowed-values -- will be disabled until the parent div is closed -->
    <button type="bar">Invalid but ignored</button>
    <button type="baz">Still ignored</button>
  </div>
  <button type="spam">Another invalid</button>
</validate>

### `disable-next`

    <!-- html-validate-disable-next deprecated -->

Disables the rule for the next element.

<validate name="disable-next-deprecated">
  <!-- html-validate-disable-next deprecated -- the next occurrence will not trigger an error -->
  <blink>This will not trigger an error</blink>
  <blink>But this line will</blink>
</validate>

## Ignoring files

### `.htmlvalidateignore` file

The `.htmlvalidateignore` file works similar to `.gitignore`, i.e. the file should contain a list of file patterns to ignore.

- Lines beginning with `#` are treated as comments
- Lines beginning with `!` are negated patterns that re-include a pattern that was ignored by an earlier pattern. It is not possible to re-include a file excluded from a parent directory.
- Paths are relative to the `.htmlvalidateignore` file

Similar to `.gitignore` if a line starts with `/` it matches from the current directory only, e.g `/foo.html` matches only `foo.html` in the current directory but not `src/foo.html`.
