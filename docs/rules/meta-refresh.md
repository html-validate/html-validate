---
docType: rule
name: meta-refresh
category: a11y
summary: Require meta refresh to have 0 second delay
standards:
  - wcag-2.2-aaa
  - wcag-2.1-aaa
  - wcag-2.0-aaa
---

# Require meta refresh to have 0 second delay

The `<meta http-equiv="refresh" content="..">` directive can be used to refresh
or redirect the page. For users with assistive technology a forced refresh or
redirect after a fixed duration can render the user unable to read and
understand the content in time.

Generally the directive should be avoided all together but under some situations
it is unavoidable (e.g. a static page generator hosted on git-based hosting
solutions don't provide an alternative for server-based redirection are forced
to use client-side redirection).

[WCAG H76][h76] requires the interval to be set to exactly 0 as to do the
redirection before any content is rendered to the client.

This rule prevents non-zero time intervals and using the directive to refresh
the page as it would be stuck in an infinite loop refreshing the same page over
and over again.

[h76]: https://www.w3.org/WAI/WCAG22/Techniques/html/H76

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
