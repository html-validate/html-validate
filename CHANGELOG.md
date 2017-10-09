# html-validate changelog

## next

### Features

- `void` rule rewritten to better handle both tag omission and self-closing. It
  learned a new option style` to allow a single style.
- new rule `element-permitted-content` verifies that only allowed content is
  used.

## 0.1.3 (2017-10-08)

### Features

- Rule documentation

### Bugfixes

- `no-dup-attr` now handles attribute names with different case.
