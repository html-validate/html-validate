@ngdoc rule
@module rules
@name prefer-button
@summary Prefer to use <button> instead of <input> for buttons
@description

# prefer to use `<button>` (`prefer-button`)

HTML5 introduces the generic `<button>` element which replaces `<input type="button">` and similar constructs.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="prefer-button">
<input type="button">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="prefer-button">
<button type="button"></button>
</validate>
