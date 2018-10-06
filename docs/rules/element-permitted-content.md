@ngdoc content
@module rules
@name element-permitted-content
@category content-model
@summary Validate permitted content from content model
@description

# verify element content model (`element-permitted-content`)

HTML defines what content is allowed under each type of element.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-permitted-content">
    <!-- <li> is only allowed with <ul> or <ol> as parent -->
    <div>
        <li>foo</li>
    </div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-permitted-content">
    <ul>
        <li>foo</li>
    </ul>
</validate>
