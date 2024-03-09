---
docType: rule
name: unrecognized-char-ref
category: syntax
summary: Disallow unrecognized character references
standards:
  - html5
---

# Disallow unrecognized character references

HTML5 defines a set of [named character references][charref] (sometimes called HTML entities) which can be used as `&name;` where `name` is the entity name, e.g. `&apos;` (`'`) or `&amp;` (`&`).
Only entities from the list can be used.
Each entity is case sensitive but some entities is defined in multiple casing variants, e.g. both `&copy;` and `&COPY;` are acceptable.

This rule ignores numerical entities such as `&#8212;` or `&#x2014;`.

[charref]: https://html.spec.whatwg.org/multipage/named-characters.html

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="unrecognized-char-ref">
    <p>&foobar;</p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="unrecognized-char-ref">
    <p>&amp;</p>
</validate>

## Options

This rule takes an optional object:

```json
{
  "ignoreCase": false,
  "requireSemicolon": true
}
```

### `ignoreCase`

If set to `true` this rule ignores the casing of the entity.

With this option **disabled** the following is **incorrect**:

<validate name="disabled-ignore-case" rules="unrecognized-char-ref" unrecognized-char-ref='{ "ignoreCase": false }'>
    <p>&Amp;</p>
</validate>

With this option **enabled** the following is **correct**:

<validate name="enabled-ignore-case" rules="unrecognized-char-ref" unrecognized-char-ref='{ "ignoreCase": true }'>
    <p>&Amp;</p>
</validate>

### `requireSemicolon`

By default named character references are terminated by a semicolon (`;`) but for legacy compatibility some are listed without.

If set to `false` legacy variants without semicolon are allowed.

With this option **enabled** the following is **incorrect**:

<validate name="enabled-require-semicolon" rules="unrecognized-char-ref" unrecognized-char-ref='{ "requireSemicolon": true }'>
    <p>&copy</p>
</validate>

With this option **disabled** the following is **correct**:

<validate name="disabled-require-semicolon" rules="unrecognized-char-ref" unrecognized-char-ref='{ "requireSemicolon": false }'>
    <p>&copy</p>
</validate>

Attribute values with a `?` is treated as a querystring and unless terminated with a `;` is considered to be a parameter and not a character reference, e.g. the following is always valid even if `&bar` looks like a reference without semicolon to terminate it:

<validate name="querystring" rules="unrecognized-char-ref">
    <a href="foo.php?foo=1&bar=2">...</a>
</validate>

## Version history

- 7.9.0 - Rule was made case sensitive and the `ignoreCase` and `requireSemicolon` options was added.
