---
docType: rule
name: no-redundant-role
summary: Disallow usage of redundant roles
---

# Disallow usage of redundant roles (`no-redundant-role`)

Some HTML5 elements have implied [WAI-ARIA roles][wai-aria-roles] and this rule disallows setting the implied roles on those elements.

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
