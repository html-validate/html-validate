@ngdoc rule
@module rules
@name no-raw-characters
@summary Disallow the use of unescaped special characters
@description

# disallow the use of unescaped special characters (`no-raw-characters`)

Some characters hold special meaning in HTML and must be escaped using character
references (html entities) to be used as plain text:

- `<` (U+003C) must be escaped using `&lt;`
- `>` (U+003E) must be escaped using `&gt;`
- `&` (U+0026) must be escaped using `&amp;`

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-raw-characters">
    <p>Fred & Barney</p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-raw-characters">
    <p>Fred &amp; Barney</p>
</validate>

## Parser

Note that documents using unescaped `<` might not parse properly due to the
strict parsing of HTML-validate. This is intentional.

For instance, in the following case `<3` is misinterpretated as a tag `<3>`
followed by a boolean attribute `Barney`.

<validate name="malformed" rules="no-raw-characters">
    <p>Fred <3 Barney</p>
</validate>
