@ngdoc content
@module rules
@name deprecated
@summary Disallow usage of deprecated elements
@description

# disallows usage of deprecated elements (`deprecated`)

HTML5 deprecated many old elements.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="deprecated">
    <center>...</center>
    <big>...</big>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="deprecated">
    <main>...</main>
</validate>
