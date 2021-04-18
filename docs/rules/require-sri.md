---
docType: rule
name: require-sri
summary: Require SRI for resources
---

# Require SRI for resources (`require-sri`)

Subresource Integrity (SRI) is a security feature that enables browsers to
verify that resources they fetch are delivered without unexpected manipulation.

Commonly needed when using Content Delivery Networks (CDN).

This rules requires the usage of the `integrity` attribute to provide the
cryptographic hash for SRI to function.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="require-sri">
    <script href="//cdn.example.net/jquery.min.js"></script>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="require-sri">
    <script href="//cdn.example.net/jquery.min.js" integrity="sha384-..."></script>
</validate>

## Options

This rule takes an optional object:

```javascript
{
	"target": "all",
}
```

### `target`

- `all` require integrity for all resources, even on same origin.
- `crossorigin` requires integrity for all crossdomain resources.

With `target` set to `crossorigin` only requests to other domains need SRI. Note
that the logic for determining crossdomain is a bit naïve, resources with a full
url (`protocol://`) or implicit protocol (`//`) counts as crossorigin even if it
technically would point to the same origin.

<validate name="crossorigin" rules="require-sri" require-sri='{"target": "crossorigin"}'>
    <!--- local resource -->
    <link href="local.css">

    <!-- resource loaded over CDN -->
    <link href="//cdn.example.net/remote.css">

</validate>
