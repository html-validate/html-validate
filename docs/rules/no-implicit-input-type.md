---
docType: rule
name: no-implicit-input-type
summary: Disallow implicit input type
---

# Disallow implicit input type (`no-implicit-input-type`)

When the `type` attribute is omitted it defaults to `text`.
Being explicit about the intended type better conveys the purpose of the input field.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-implicit-input-type">
	<input>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-implicit-input-type">
	<input type="text">
</validate>

## Version history

- %version% - Rule added.
