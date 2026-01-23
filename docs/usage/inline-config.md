---
docType: content
title: Inline configuration
name: inline-config
nav: userguide
---

# Inline configuration

Configuration can be changed inline using directives (as HTML comments).

    <!-- html-validate-ACTION OPTIONS -- COMMENT -->

alternatively:

    <!-- [html-validate-ACTION OPTIONS -- COMMENT] -->

`ACTION` is an action such as `enable`, `disable` etc and `OPTIONS` is arguments to the action.
Comment is optional but encouraged.

::: info Optional brackets
Versions earlier than 10.7.0 required brackets around the directive:

    <!-- [html-validate-ACTION OPTIONS -- COMMENT] -->

The brackets are now optional, either syntax can be used.
:::

Multiple rules can be enabled/disabled at once by using a comma-separated list:

    <!-- html-validate-disable-next void-style, deprecated -- disable both rules -->

Comments can be entered using both `--` and `:` as delimiter:

<validate name="directive-commend">
	<!-- html-validate-disable-next deprecated -- justification for disabling -->
	<blink>Blinking text</blink>
	<!-- html-validate-disable-next deprecated: justification for disabling -->
	<blink>Blinking text</blink>
</validate>

## `enable`

    <!-- html-validate-enable element-permitted-content -->

Enables a rule. If the severity is set to `off` it will be raised to `error`,
i.e a previously disabled warning will remain a warning after enabling it again.

## `disable`

    <!-- html-validate-disable deprecated -->

Disable a rule for the rest of the file or until re-enabled using `enable` directive.

## `disable-block`

    <!-- html-validate-disable-block attribute-allowed-values -->

Disables a rule for a block of elements.
All siblings and descendants following the directive will not trigger any errors.

<validate name="disable-block-button-type">
  <div>
    <button type="foo">Invalid button</button>
    <!-- html-validate-disable-block attribute-allowed-values -- will be disabled until the parent div is closed -->
    <button type="bar">Invalid but ignored</button>
    <button type="baz">Still ignored</button>
  </div>
  <button type="spam">Another invalid</button>
</validate>

## `disable-next`

    <!-- html-validate-disable-next deprecated -->

Disables the rule for the next element.

<validate name="disable-next-deprecated">
  <!-- html-validate-disable-next deprecated -- the next occurrence will not trigger an error -->
  <blink>This will not trigger an error</blink>
  <blink>But this line will</blink>
</validate>
