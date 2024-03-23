---
docType: content
nav: false
---

# Predefined patterns

Rules enforcing patterns such as {@link rule:class-pattern} and {@link rule:id-pattern} takes one or more as option.
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

Matches strings with words separated by underscore.
Must start with a letter and cannot end with an underscore.
Multiple consecutive underscores are not allowed.
