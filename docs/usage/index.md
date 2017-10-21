@ngdoc content
@module usage
@name Usage
@description

# Usage

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
	"./file'
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
  ],
}
```

where severity can be one of:

- `"error"` (or `2`) to give error.
- `"warn"` (or `1`) to warn.
- `"off"` (or `0`) to disable

Some options takes optional parameters when using the form `["severity",
OPTIONS]`.

See [/rules] for a list of all available rules and options.
