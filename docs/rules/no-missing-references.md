@ngdoc rule
@name no-missing-references
@category document
@summary Require all element references to exist
@description

# no missing references (`no-missing-references`)

Require all elements referenced by attributes such as `for` to exist in the
current document.

Checked attributes:

- `for`
- `aria-labelledby`
- `aria-describedby`

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-missing-references">
    <label for="missing-input"></label>
    <div aria-labelledby="missing-text"></div>
    <div aria-describedby="missing-text"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-missing-references">
    <label for="my-input"></label>
    <div id="verbose-text"></div>
    <div aria-labelledby="verbose-text"></div>
    <div aria-describedby="verbose-text"></div>
    <input id="my-input">
</validate>
