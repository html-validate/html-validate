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

```html validate name="incorrect" rules="unrecognized-char-ref"
<p>&foobar;</p>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="unrecognized-char-ref"
<p>&amp;</p>
```

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

```html validate name="disabled-ignore-case" rules="unrecognized-char-ref" unrecognized-char-ref='{ "ignoreCase": false }'
<p>&Amp;</p>
```

With this option **enabled** the following is **correct**:

```html validate name="enabled-ignore-case" rules="unrecognized-char-ref" unrecognized-char-ref='{ "ignoreCase": true }'
<p>&Amp;</p>
```

### `requireSemicolon`

By default named character references are terminated by a semicolon (`;`) but for legacy compatibility some are listed without.

If set to `false` legacy variants without semicolon are allowed.

With this option **enabled** the following is **incorrect**:

```html validate name="enabled-require-semicolon" rules="unrecognized-char-ref" unrecognized-char-ref='{ "requireSemicolon": true }'
<p>&copy</p>
```

With this option **disabled** the following is **correct**:

```html validate name="disabled-require-semicolon" rules="unrecognized-char-ref" unrecognized-char-ref='{ "requireSemicolon": false }'
<p>&copy</p>
```

In text content browsers also decode a legacy reference followed by more characters, e.g. `&section` is rendered as `§ion`.
With this option **enabled** the legacy reference must be terminated by a semicolon, or the ampersand escaped as `&amp;`:

```html validate name="legacy-prefix" rules="unrecognized-char-ref" unrecognized-char-ref='{ "requireSemicolon": true }'
<p>&section</p>
```

This does not apply to attribute values where such references are left as-is.

Attribute values with a `?` is treated as a querystring and unless terminated with a `;` is considered to be a parameter and not a character reference, e.g. the following is always valid even if `&bar` looks like a reference without semicolon to terminate it:

```html validate name="querystring" rules="unrecognized-char-ref"
<a href="foo.php?foo=1&bar=2">...</a>
```

## Version history

- 11.16.4 - Legacy character references without semicolon followed by text (e.g. `&section`) in text content are now reported when `requireSemicolon` is enabled.
- 7.9.0 - Rule was made case sensitive and the `ignoreCase` and `requireSemicolon` options was added.
