@ngdoc content
@module rules
@name class-pattern
@category style
@summary Require classes to match a specific pattern
@description

# require a specific class format (`class-pattern`)

Requires all classes to match a given pattern.

## Rule details

Examples of **incorrect** code for this rule:

```html
<div class="fooBar"></foobar>
```

Examples of **correct** code for this rule:

```html
<div class="foo-bar"></div>
```

## Options

This rule takes and optional object:

```javascript
{
    "pattern": "kebabcase"
}
```

### Pattern

Either one of the presets or a custom regular expression.

- `"kebabcase"` matches lowercase letters, digits and dash (`[a-z0-9-]`) (default)
- `"camelcase"` matches lowercase letter followed by letters and digits (`[a-z][a-zA-Z0-9]`)
- `"underscore"` matches lowercase letters, digits and underscore (`[a-z0-9_]`)
