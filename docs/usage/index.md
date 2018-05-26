@ngdoc content
@module usage
@name Getting started
@description

# Gettings started

HTML-validate is an offline HTML5 validator.

## Installation

Install using `npm`:

    npm install --save-dev html-validate

Create `.htmlvalidate.json`:

```js
{
  "extends": [
    "htmlvalidate:recommended"
  ],
}
```

Run with:

    node_modules/.bin/html-validate yourfile.html

## Configuration

### `extends`

Configuration can be extended from sharable configuration.

```js
{
  "extends": [
    "my-npm-package",
	"./file"
  ],
}
```

Each package and file must export a valid configuration object.

### `rules`

```js
{
  "rules": {
    "some-rules": "severity",
	"other-rule": ["severity", {"option": true}]
  },
}
```

where severity can be one of:

- `"error"` (or `2`) to give error.
- `"warn"` (or `1`) to warn.
- `"off"` (or `0`) to disable

Some options takes optional parameters when using the form `["severity",
OPTIONS]`.

See [rules](/rules) for a list of all available rules and options.

### `elements`

For proper validation some metadata for each element is required, detailing in
which context it can be used, allowed/disallowed attributes, etc. If `elements`
is not specified it defaults to `["html5"]` which is a bundled collection for
all HTML5 elements.

```js
{
  "elements": [
    "html5",
	"my-npm-package",
	"./file"
  ],
}
```

Each entry will try to load metadata from (search in following order):

1. Named bundled metadata.
2. NPM package with the same name.
3. A local file, json or js. Path is relative to the configuration file.

See [elements metadata](/usage/elements.html) for details about writing your own
metadata.
