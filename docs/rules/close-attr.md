@ngdoc rule
@name close-attr
@summary Disallow end tags from having attributes
@description

# disallows end tags with attributes (`close-attr`)

HTML disallows end tags to have attributes.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="close-attr">
    <div></div id="foo">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="close-attr">
    <div id="foo"></div>
</validate>
