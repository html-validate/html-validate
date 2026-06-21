---
docType: content
title: Flat configuration
name: flat-configuration
nav: userguide
---

# Flat configuration

::: warning Experimental

Flat configuration is **experimental**.
The API and file format may change in future releases.

:::

Flat configuration is an alternative to the per-directory rc-style `.htmlvalidate.*` files.
Instead of scattered configuration files, a single `html-validate.config.js` file at the project root describes all configuration in one place.

## Current limitations

- Only works via the CLI (auto-detected) or when explicitly constructing a `FlatConfigLoader` programmatically.
- Browser environments are not supported.

## Configuration file

The following filenames are supported:

- `html-validate.config.js`
- `html-validate.config.mjs`
- `html-validate.config.cjs`
- `html-validate.config.ts`
- `html-validate.config.mts`
- `html-validate.config.cts`

It should be placed at the root of your project and export an array of configuration objects:

```ts
import { defineFlatConfig } from "html-validate";

export default defineFlatConfig([
  {
    files: ["*.html"],
    rules: {
      "element-permitted-content": "error",
    },
  },
]);
```

In this example, the optional `defineFlatConfig()` helper is used to construct a configuration array with just one object.
The configuration object matches any `.html` file and enables the rule {@link rule:element-permitted-content}.

::: info TypeScript

If you use a TypeScript configuration file you need to use NodeJS v22.18 or later which supports [running TypeScript natively](https://nodejs.org/learn/typescript/run-natively), or use the `--experimental-strip-types` flag.

Any typechecking of the file must be done externally by the user.

:::

## Configuration objects

Each configuration object defines the configuration used for a set of files.
Each configuration object may include these properties:

- `name` - A name of this configuration object. The name is used in error messages and for troubleshooting such as when using the CLI flag `--print-config`.
- `files` - An array of glob patterns this configuration should apply to. If not specified this object applies to all files matched by one or more other configuration objects.
- `ignores` - An array of glob patterns this configuration should not apply to. If not specified this object applies to all files matched by one or more `files` pattern. If specified without any other properties, then the patterns provided by `ignores` acts as global ignores and is applied to all other configuration objects.
- `elements` - An array of {@link usage/elements element metadata}, typically set to the bundled `html5` metadata.
- `plugins` - An array of plugins to use.
- `transform` - An object mapping transformers to use.
- `rules` - An object containing the configured rules. When `files` or `ignores` are specified, these rule configurations only applies to the matching files.

## Specifying `files` and `ignores`

Glob patterns are matched with NodeJS [path.matchesGlob()](https://nodejs.org/api/path.html#pathmatchesglobpath-pattern) and are relative to the directory with the configuration file.

A pattern without a path separator (e.g. `*.html`) is equivalent to matching with globstar (e.g. `**/*.html`).

When `files` are omitted, the configuration object matches all files matched by one or more other configuration blocks.

```ts
import { defineFlatConfig } from "html-validate";

export default defineFlatConfig([
  {
    /* eslint-disable-next-line unicorn/comment-content -- false positive */
    /* matches all files ending with .html */
    files: ["*.html"],
    rules: { "void-style": "error" },
  },

  {
    /* eslint-disable-next-line unicorn/comment-content -- false positive */
    /* matches only files ending with .html in the public/ folder */
    files: ["public/**/*.html"],
    rules: { "no-trailing-whitespace": "off" },
  },

  {
    /* eslint-disable-next-line unicorn/comment-content -- false positive */
    /* matches files ending with .html except in the public/ folder */
    files: ["*.html"],
    ignores: ["public/**"],
    rules: { "no-unknown-elements": "error" },
  },
]);
```

Configuration objects without an explicit `files` or `ignores` matches all files matched by one or more configuration objects.

```ts
import { defineFlatConfig } from "html-validate";

export default defineFlatConfig([
  /* applies everywhere */
  {
    rules: { "element-permitted-content": "error" },
  },
]);
```

By default, the CLI tool runs on all `**/*.html` files unless ignored by [global ignores](#global ignores).

## Specify files with arbitrary extensions

To validate files with extensions other than the default `**/*.html` one or more configuration object must match with `files` with a literal extension (e.g. `**/*.vue`).

For example, to validate `.vue` files:

```ts
import { defineFlatConfig } from "html-validate";

export default defineFlatConfig([
  {
    files: ["**/*.vue"],
  },
]);
```

## Global ignores

- When `ignores` is used without other properties, it acts as a global ignore (applying to all other configuration objects).
- When `ignores` is used with `files`, it acts as a local ignore only applying to the set of files matched by `files`.

```ts
import { defineFlatConfig } from "html-validate";

export default defineFlatConfig([
  /* ignore build artifacts */
  {
    ignores: ["coverage/**", "public/**"],
  },
]);
```

## Configuration merging

All configuration objects whose `files` pattern matches the validated file are merged in order; later configuration objects overriding previous when there is a conflict.

```ts
import { defineFlatConfig } from "html-validate";

export default defineFlatConfig([
  {
    files: ["*.html"],
    rules: {
      "element-permitted-content": "error",
      "void-style": "error",
    },
  },

  /* override the void-style rule for a set of files, all other configuration still applies */
  {
    files: ["public/**/*.html"],
    rules: {
      "void-style": "off",
    },
  },
]);
```

## Using presets

{@link presets Rule presets} are available as exports from `html-validate/presets`:

```ts
import { defineFlatConfig } from "html-validate";
import { recommended } from "html-validate/presets";

export default defineFlatConfig([
  {
    files: ["*.html"],
    ...recommended,
  },
]);
```

## Using element metadata

Bundled HTML5 element metadata are available as export from `html-validate/html5`:

```ts
import { defineFlatConfig } from "html-validate";
import html5 from "html-validate/elements/html5";

export default defineFlatConfig([
  {
    files: ["*.html"],
    elements: [html5],
  },
]);
```
