@ngdoc rule
@module rules
@name unrecognized-char-ref
@summary Disallow unrecognized character references
@description

# disallow unrecognized character references (`unrecognized-char-ref`)

HTML defines a set of [named character references][charref] (sometimes called
HTML entities) which can be used as `&name;` where `name` is the entity name,
e.g. `&apos;` (`'`) or `&amp;` (`&`). Only entities on the list can be used.

[charref]: https://dev.w3.org/html5/html-author/charref

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="unrecognized-char-ref">
    <p>&foobar;</p>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="unrecognized-char-ref">
    <p>&amp;</p>
</validate>
