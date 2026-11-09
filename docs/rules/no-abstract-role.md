---
docType: rule
name: no-abstract-role
category: a11y
summary: Disallow usage of abstract WAI-ARIA roles
standards:
  - wai-aria
---

# Disallow usage of abstract WAI-ARIA roles

WAI-ARIA defines a list of abstract roles which cannot be used by authors.
For [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#abstract_roles) the list of abstract roles are:

- `command`
- `composite`
- `input`
- `landmark`
- `range`
- `roletype`
- `section`
- `sectionhead`
- `select`
- `structure`
- `widget`
- `window`

Typically one of the role subclasses should be used instead.

By default WAI-ARIA version 1.2 is used but can be configured with the {@link getting-started#aria aria property}.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="no-abstract-role"
<div role="landmark"></div>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="no-abstract-role"
<div role="navigation"></div>
```

## Version history

- 8.12.0 - Rule added.
