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

Each package and file must export a valid configuration object. Plugins may also
create [configuration presets](/dev/writing-plugins.html).

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

Some options takes optional parameters when using the form `["severity", OPTIONS]`.

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
	"./file",
	{ ... }
  ],
}
```

Each entry will try to load metadata from (search in following order):

1. Named bundled metadata.
2. NPM package with the same name.
3. A local file, json or js. Path is relative to the configuration file.

An object can also be passed with inline metadata but it is highly recommended
to write it to a separate file.

See [elements metadata](/usage/elements.html) for details about writing your own
metadata.

### `plugins`

List of extra plugins to load. Can be either a NPM package or relative path to a
local file, i.e. when writing custom rules inside the repo.

Plugins can contain additional rules.

See [writing plugins](/dev/writing-plugins.html) for details about creating your own plugins.

```js
{
  "plugins": [
    "my-fancy-plugin",
    "./local-plugin"
  ]
}
```

### `transform`

Transform input files to extract HTML chunks, e.g. extract templates from
javascript sources. See [transformers](/usage/transformers.html) for details.

```js
{
  "transform": {
    "^.*\\.vue$": "html-validate-vue"
  }
}
```

will transform `*.vue` with the `html-validate-vue` NPM package. Use a relative
path to use a local script (use `<rootDir>` to refer to the path to
`package.json`, e.g. `<rootDir>/my-transformer.js`).

## Inline configuration

Configuration can be changed inline using directive of the form:

    <!-- [html-validate-ACTION OPTIONS: COMMENT] -->

where `ACTION` is an action such as `enable`, `disable` etc and `OPTIONS` is
arguments to the action. Comment is optional but encouraged.

Multiple rules can be enabled/disabled at once by using a comma-separated list:

    <!-- [html-validate-disable-next void, deprecated: disable both rules] -->

### `enable`

    <!-- [html-validate-enable element-permitted-content] -->

Enables a rule. If the severity is set to `off` it will be raised to `error`,
i.e a previously disabled warning will remain a warning after enabling it again.

### `disable`

    <!-- [html-validate-disable deprecated] -->

Disable a rule for the rest of the file or until reenabled using `enable`
directive.

### `disable-block`

    <!-- [html-validate-disable-block void] -->

Disables a rule for a block of elements. All siblings and descendats following
the directive will not trigger any errors.

```html
<i />error
<div>
  <!-- [html-validate-disable-block void: will be disabled until the parent div is closed] -->
  <i />no error
  <p><i />no error</p>
  <i />no error
</div>
<i />error
```

### `disable-next`

    <!-- [html-validate-disable-next deprecated] -->

Disables the rule for the next element.

<!-- prettier-ignore-start -->
```html
<!-- [html-validate-disable-next deprecated: the next occurrence will not trigger an error] -->
<blink>This will not trigger an error</blink>
<blink>But this line will</blink>
```
<!-- prettier-ignore-end -->
