---
docType: rule
name: no-raw-characters
category: syntax
summary: Disallow the use of unescaped special characters
standards:
  - html5
---

# Disallow the use of unescaped special characters

Some characters hold special meaning in HTML and must be escaped using character
references (html entities) to be used as plain text:

- `<` (U+003C) must be escaped using `&lt;`
- `>` (U+003E) must be escaped using `&gt;`
- `&` (U+0026) must be escaped using `&amp;`

Additionally, unquoted attribute values further restricts the allowed
characters:

- `"` (U+0022) must be escaped using `&quot;`
- `'` (U+0027) must be escaped using `&apos;`
- `=` (U+003D) must be escaped using `&quals;`
- `` ` `` (U+0060) must be escaped using `&grave;`

Quotes attributes must escape only the following characters:

- `"` (U+0022) must be escaped using `&quot;` if attribute is quoted using `"`
- `'` (U+0027) must be escaped using `&apos;` if attribute is quoted using `'`

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-raw-characters">
    <p>Fred & Barney</p>
    <p class=foo's></p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-raw-characters">
    <p>Fred &amp; Barney</p>
    <p class=foo&apos;s></p>
    <p class="'foo'"></p>
</validate>

## Parser

Note that documents using unescaped `<` might not parse properly due to the
strict parsing of HTML-validate. This is intentional.

For instance, in the following case `<3` is misinterpreted as a tag `<3>`
followed by a boolean attribute `Barney`.

<validate name="malformed" rules="no-raw-characters">
    <p>Fred <3 Barney</p>
</validate>

## Options

This rule takes an optional object:

```json
{
  "relaxed": false
}
```

### `relaxed`

HTML5 introduces the concept of [ambiguous ampersands] and relaxes the rules
slightly. Using this options ampersands (`&`) only needs to be escaped if the
context is ambiguous (applies to both text nodes and attribute values).

This is disabled by default as explicit encoding is easier for readers than
implicitly having to figure out if encoding is needed or not.

Examples of **correct** code with this option:

<validate name="relaxed" rules="no-raw-characters" no-raw-characters='{"relaxed": true}'>
    <!-- Not ambiguous: & is followed by whitespace -->
    <p>Fred & Barney</p>

    <!-- Not ambiguous: &Barney is not terminated by ; -->
    <p>Fred&Barney</p>

    <!-- Not ambiguous: = and " both stops the character reference -->
    <a href="?foo&bar=1&baz"></p>

    <!-- Not ambiguous: even unquoted & is understood to be stopped by > -->
    <a href=?foo&bar></p>

</validate>

[ambiguous ampersands]: https://html.spec.whatwg.org/multipage/syntax.html#syntax-ambiguous-ampersand
