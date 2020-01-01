@ngdoc rule
@name close-order
@summary Require elements to be closed in correct order
@description

# disallows elements closed in the wrong order (`close-order`)

HTML requires elements to be closed in the correct order.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="close-order">
    <p><strong></p></strong>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="close-order">
    <p><strong></strong></p>
</validate>
