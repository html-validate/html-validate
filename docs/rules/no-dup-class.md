@ngdoc rule
@module rules
@name no-dup-class
@summary Disallow duplicated classes
@description

# disallows duplicated classes on same element (`no-dup-class`)

Prevents unnecessary duplication of class names.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-dup-class">
    <div class="foo bar foo"></div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-dup-class">
    <div class="foo bar"></div>
</validate>
