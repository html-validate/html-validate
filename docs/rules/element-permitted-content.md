---
docType: rule
name: element-permitted-content
category: content-model
summary: Validate permitted content from content model
---

# Validate element content model (`element-permitted-content`)

HTML defines what content is allowed under each type of element.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-permitted-content">
    <!-- <li> is only allowed with <ul> or <ol> as parent -->
    <div>
        <li>foo</li>
    </div>

    <!-- interactive elements cannot be nested -->
    <button>
        <a href="#">Lorem ipsum</a>
    </button>

    <!-- required ancestors -->
    <area>

</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-permitted-content">
    <ul>
        <li>foo</li>
    </ul>

    <button>
        Lorem ipsum
    </button>

    <map>
        <area>
    </map>

</validate>
