---
docType: rule
name: element-permitted-content
category: content-model
summary: Validate permitted content
standards:
  - html5
---

# Validate element content

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

</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-permitted-content">
    <ul>
        <li>foo</li>
    </ul>

    <button>
        Lorem ipsum
    </button>

</validate>

## Version history

- 7.2.0 - Required ancestors moved to new rule {@link element-required-ancestor}.
