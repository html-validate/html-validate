---
docType: rule
name: no-abstract-role
category: a11y
summary: Disallow usage of abstract WAI-ARIA roles
---

# Disallow usage of abstract WAI-ARIA roles (`no-abstract-role`)

WAI-ARIA defines a list of [abstract roles](https://www.w3.org/TR/wai-aria-1.2/#abstract_roles) which cannot be used by authors:

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

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-abstract-role">
    <div role="landmark"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-abstract-role">
    <div role="navigation"></div>
</validate>

## Version history

- 8.12.0 - Rule added.
