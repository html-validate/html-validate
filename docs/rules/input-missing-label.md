@ngdoc rule
@module rules
@name input-missing-label
@category a17y
@summary Require input to have label
@description

# require input elements to have a label (`input-missing-label`)

Labels are associated with the input element and is required for a17y.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="input-missing-label">
    <!-- no label element at all -->
    <div>
        <strong>My field</strong>
        <input type="text">
    </div>

    <!-- unassociated label -->
    <div>
        <label>My field</label>
        <input type="text">
    </div>

</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="input-missing-label">
    <!-- label with descendant -->
    <div>
        <label>My field <input type="text"></label>
    </div>

    <!-- associated label -->
    <div>
        <label for="my-field">My field</label>
        <input id="my-field" type="text">
    </div>

</validate>
