---
docType: rule
name: element-permitted-occurrences
category: content-model
summary: Validate permitted number of element occurrences
standards:
  - html5
---

# Validate permitted number of element occurrences

Some elements may only be used a fixed amount of times in given context.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-permitted-occurrences">
    <!-- table footer can only be used once -->
    <table>
        <tfoot></tfoot>
        <tfoot></tfoot>
    </div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-permitted-occurrences">
    <table>
        <tfoot></tfoot>
    </table>
</validate>
