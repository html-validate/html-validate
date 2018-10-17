@ngdoc content
@module dev
@name Writing plugins
@description

Writing plugins
===============

A plugin must expose a single object:

```js
module.exports = {
  /* ... */
};
```

### Rules

See [writing rules](/dev/writing-rules.html) for details on how to write a rules.

To expose rules in the plugin use the `plugin` field. Each plugin should use a
unique prefix for each rule.

```js
const MyRule = require('./rules/my-rule.js');
const AnotherRule = require('./rules/another-rule.js');

module.exports = {
  rules: {
    "my-prefix/my-rule": MyRule,
    "my-prefix/another-rule": AnotherRule,
  },
};
```

This makes the rules accessable as usual when configuring in
`.htmlvalidate.json`:

```js
{
  "plugins": [
    "my-fancy-plugin",
  ],
  "rules": {
    "my-prefix/my-rule": "error"
  },
}
```
