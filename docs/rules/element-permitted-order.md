@ngdoc rule
@module rules
@name element-permitted-order
@category content-model
@summary Validate required order from content model
@description

# verify element content model (`element-permitted-order`)

Some elements has a specific order the children must use.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-permitted-order">
    <!-- table caption must be used before thead -->
    <table>
        <thead></thead>
        <caption></caption>
    </div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-permitted-order">
    <table>
        <caption></caption>
        <thead></thead>
    </table>
</validate>
