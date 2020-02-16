---
docType: rule
name: script-element
category: content-model
summary: Require end tag for `<script>`
---

# Require end tag for `<script>` element (`script-element`)

For legacy reasons the `<script>` element must include a `</script>` end tag even when using the `src` attribute.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="script-element">
    <script src="myscript.js"/>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="script-element">
    <script src="myscript.js"></script>
</validate>
