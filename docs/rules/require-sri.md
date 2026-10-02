---
docType: rule
name: require-sri
summary: Require SRI for resources
category: security
standards:
  - sri
---

# Require SRI for resources

Subresource Integrity (SRI) is a security feature that enables browsers to
verify that resources they fetch are delivered without unexpected manipulation.

Commonly needed when using Content Delivery Networks (CDN).

This rules requires the usage of the `integrity` attribute to provide the
cryptographic hash for SRI to function.

## Rule details

Examples of **incorrect** code for this rule:

```html validate name="incorrect" rules="require-sri"
<script src="//cdn.example.net/jquery.min.js"></script>
```

Examples of **correct** code for this rule:

```html validate name="correct" rules="require-sri"
<script src="//cdn.example.net/jquery.min.js" integrity="sha384-..."></script>
```

## Options

This rule takes an optional object:

```json
{
  "target": "all",
  "include": null,
  "exclude": null
}
```

### `target`

- `all` require integrity for all resources, even on same origin.
- `crossorigin` requires integrity for all crossdomain resources.

With `target` set to `crossorigin` only requests to other domains need SRI. Note
that the logic for determining crossdomain is a bit naïve, resources with a full
url (`protocol://`) or implicit protocol (`//`) counts as crossorigin even if it
technically would point to the same origin.

```html validate name="crossorigin" rules="require-sri" require-sri='{"target": "crossorigin"}'
<!--- local resource -->
<link rel="stylesheet" href="local.css" />

<!-- resource loaded over CDN -->
<link rel="stylesheet" href="//cdn.example.net/remote.css" />
```

### `include`

- type: `string[] | null`

If set only URLs matching one or more patterns in this array yields errors.
Patterns are matched as substrings.

For instance, with the following configuration only the first URL yields an error:

```json
{
  "include": ["//cdn.example.net/"]
}
```

```html validate name="include-option" rules="require-sri" require-sri='{"include": ["//cdn.example.net/"]}'
<!-- matches included pattern, yields error -->
<link rel="stylesheet" href="//cdn.example.net/remote.css" />
<!-- doesn't match, no error -->
<link rel="stylesheet" href="//static-assets.example.org/remote.css" />
```

### `exclude`

- type: `string[] | null`

If set URLs matching one or more pattern in this array is ignored.
Patterns are matched as substrings.

For instance, with the following configuration only the second URL yields an error:

```json
{
  "exclude": ["//cdn.example.net/"]
}
```

```html validate name="exclude-option" rules="require-sri" require-sri='{"exclude": ["//cdn.example.net/"]}'
<!-- doesn't match excluded pattern, yields error -->
<link rel="stylesheet" href="//cdn.example.net/remote.css" />
<!-- matches excluded pattern, no error -->
<link rel="stylesheet" href="//static-assets.example.org/remote.css" />
```

## Version history

- 9.2.1 - only tests `<link>` with `rel` set to one of `stylesheet`, `preload` or `modulepreload`.
- 7.1.0 - `include` and `exclude` options added
