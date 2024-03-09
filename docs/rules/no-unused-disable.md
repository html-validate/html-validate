---
docType: rule
name: no-unused-disable
summary: Disallow unused disable directives
---

# Disallow unused disable directives

Rules can be disabled using {@link usage#inline-configuration directives} such as `<!-- [html-validate-disable-next my-rule] -->`.
This rules disallows unneccesary disabled rules, i.e. rules that would not have generated any error even if enabled.

This is usually a case of refactoring or changing environment.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-unused-disable attribute-allowed-values">
	<!-- [html-validate-disable-next attribute-allowed-values -- no error, disable is invalid] -->
	<button type="submit"></button>
</validate>

Examples of **correct** code for this rule:

<validate name="correct-removed" rules="no-unused-disable attribute-allowed-values">
	<!-- disable removed, no error -->
	<button type="submit"></button>
</validate>

<validate name="correct-error-present" rules="no-unused-disable attribute-allowed-values">
	<!-- [html-validate-disable-next attribute-allowed-values -- element has error, disable is valid] -->
	<button type="foobar"></button>
</validate>

This rule can also disable itself:

<validate name="correct-disabled" rules="no-unused-disable attribute-allowed-values">
	<!-- [html-validate-disable-next attribute-allowed-values, no-unused-disable -- no error as no-unused-disable is also disabled] -->
	<button type="submit"></button>
</validate>

## Version history

- 7.13.1 - Rule is allowed to disable itself with directive.
- 7.13.0 - Rule added.
