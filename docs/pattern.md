---
docType: content
nav: false
---

# Predefined patterns

Rules enforcing patterns such as {`@link` rule:class-pattern} and {`@link` rule:id-pattern} take one or more patterns as an option.

```jsonc
{
  "pattern": ["kebabcase"],
}
```

This is a list of predefined patterns that can be used with such rules.

## `kebabcase`

- `lorem-ipsum-dolor-sit-amet`

Matches strings with words separated by hyphen.
Must start with a letter and cannot end with a hyphen.
Multiple consecutive hyphens are not allowed.

## `camelcase`

- `loremIpsumDolorSitAmet`

Matches strings with words the first letter of each word capitalized except the initial letter.
Must start with a letter.

## `snakecase`

- `lorem_ipsum_dolor_sit_amet`
- alias: `underscore`

Matches strings with words separated by underscore.
Must start with a letter and cannot end with an underscore.
Multiple consecutive underscores are not allowed.

## `bem`

- `lorem-ipsum__dolor--sit-amet`

Matches string using [BEM naming convention](https://getbem.com/naming/).

## Custom patterns

In addition to the predefined patterns above, you can define custom regular expressions using either a string wrapped with `/` (`"/^[a-z-]+/$"`) or a `RegExp` object.
Each keyword (e.g. each class) is matched individually so you do not need to handle whitespace between them.

```jsonc
{
  "pattern": ["/^[a-z-]+$/"],
}
```

When using Javascript you may also define the pattern directly as a regular expression:

```js nocompile
{
	"pattern": [/^[a-z-]+$/],
}
```

::: tip

You typically want to use `^` and/or `$` to match the start or end of the keyword.

:::
