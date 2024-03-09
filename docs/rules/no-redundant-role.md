---
docType: rule
name: no-redundant-role
category: a11y
summary: Disallow usage of redundant roles
standards:
  - html-aria
---

# Disallow usage of redundant roles

Some HTML5 elements have implicit [WAI-ARIA roles][wai-aria-roles] defined by [ARIA in HTML][html-aria].
This rule disallows using the `role` attribute to set the role to same as the implied role.

[html-aria]: https://www.w3.org/TR/html-aria/#docconformance
[wai-aria-roles]: https://www.w3.org/TR/wai-aria-1.1/#role_definitions

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-redundant-role">
  <main role="main">
    <ul>
      <li role="listitem">Lorem ipsum</li>
    </ul>
  </main>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-redundant-role">
  <ul>
    <li role="presentation">Lorem ipsum</li>
  </ul>
</validate>
