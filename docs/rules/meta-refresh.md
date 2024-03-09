---
docType: rule
name: meta-refresh
category: a11y
summary: Require meta refresh to have 0 second delay
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
tags:
  - sc-2.2.1
  - sc-2.2.4
  - sc-3.2.5
  - h76
  - g110
---

# Require meta refresh to have 0 second delay

The `<meta http-equiv="refresh" content="..">` directive can be used to refresh or redirect the page.
For users with assistive technology a forced refresh or redirect after a fixed duration can render the user unable to read and understand the content in time.

Generally the directive should be avoided all together but under some situations it is unavoidable (e.g. a static page generator hosted on git-based hosting solutions don't provide an alternative for server-based redirection are forced to use client-side redirection).

[WCAG H76][h76] requires the interval to be set to exactly 0 as to do theredirection before any content is rendered to the client.

This rule prevents non-zero time intervals and using the directive to refresh the page as it would be stuck in an infinite loop refreshing the same page over and over again.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect-delay" rules="meta-refresh">
	<meta http-equiv="refresh" content="5;url=target.html">
</validate>

<validate name="incorrect-url" rules="meta-refresh">
	<meta http-equiv="refresh" content="0">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="meta-refresh">
	<meta http-equiv="refresh" content="0;url=target.html">
</validate>

## Options

This rule takes an optional object:

```json
{
  "allowLongDelay": false
}
```

### `allowLongDelay`

- type: `boolean`
- default: `false`

Delays longer than 20 hours is exempt from [WCAG Success Criterion 2.2.1 Timing Adjustable][timing-adjustable].
By enabling this option the refresh delay can be set to a value greater than `72000`.

With this option **disabled**:

<validate name="long-delay-invalid" rules="meta-refresh" meta-refresh='{"allowLongDelay": false}'>
	<meta http-equiv="refresh" content="72001">
</validate>

With this option **enabled**:

<validate name="long-delay-valid" rules="meta-refresh" meta-refresh='{"allowLongDelay": true}'>
	<meta http-equiv="refresh" content="72001">
</validate>

## References

- [WCAG Success Criterion 2.2.1: Timing Adjustable (A)][timing-adjustable]
- [WCAG Success Criterion 2.2.4: Interruptions (Level AAA)][interruptions]
- [WCAG Success Criterion 3.2.5: Change on Request (Level AAA)][change-on-request]
- [WCAG H76: Using meta refresh to create an instant client-side redirect][h76]
- [WCAG G110: Using an instant client-side redirect][g110]

## Version history

- 8.14.0 - `allowLongDelay` option added.

[timing-adjustable]: https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html
[interruptions]: https://www.w3.org/WAI/WCAG21/Understanding/interruptions.html
[change-on-request]: https://www.w3.org/WAI/WCAG21/Understanding/change-on-request
[h76]: https://www.w3.org/WAI/WCAG22/Techniques/html/H76
[g110]: https://www.w3.org/WAI/WCAG22/Techniques/general/G110
