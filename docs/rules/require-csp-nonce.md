---
docType: rule
name: require-csp-nonce
summary: Require CSP nonce for resources
category: security
standards:
  - csp
---

# Require CSP nonce for resources

Requires that a [Content-Security-Policy (CSP)][mdn-csp] nonce is present on elements required by the policy.

The CSP nonce is a cryptography secure random token and must match the `Content-Security-Policy` header for the given resource.
The token should be unique per request and should not be guessable by an attacker.
It is used to prevent cross site scripting (XSS) by preventing malicious actors from injecting scripts into the page.

> `Content-Security-Policy: script-src 'nonce-r4nd0m'`

Given the above header all inline `<script>` elements must contain the `nonce="r4nd0m"` attribute (see examples below).

[mdn-csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="require-csp-nonce">
	<script>
		doFancyStuff();
	</script>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="require-csp-nonce">
	<script nonce="r4nd0m">
		doFancyStuff();
	</script>
</validate>

## When to use

If you use nonces in your CSP policies you should use this rule to ensure nonces are present on the elements.

If you dont use nonces or CSP you should not use this rule.

## Options

This rule takes an optional object:

```json
{
  "tags": ["script", "style"]
}
```

### `tags`

List of elements to check for the `nonce` attribute.

Limited to:

- `script` (when `src` attribute is not present)
- `style`

## Version history

- 7.1.0 - rule added
