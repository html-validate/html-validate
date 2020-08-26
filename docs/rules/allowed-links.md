---
docType: rule
name: allowed-links
category: document
summary: Disallow link types
---

# Disallows link types (`allowed-links`)

This rules checks the link destination and disallows certain categories of links:

- External links
- Relative paths
- Relative to document base url

The rule checks links from:

- `<a href=""></a>`
- `<img src="..">`
- `<link src="..">`
- `<script src=".."></script>`

Anchor links are ignored by this rule.

## Rule details

This rules requires additional configuration to yield errors.
By default all links are allowed even when this rule is enabled.

## Options

This rule takes an optional object:

```json
{
  "allowExternal": true,
  "allowRelative": true,
  "allowAbsolute": true,
  "allowBase": true
}
```

### `allowExternal`

By setting `allowExternal` to `false` any link to a external resource will be disallowed.

<validate name="external-invalid" rules="allowed-links" allowed-links='{"allowExternal": false}'>
  <a href="http://example.net/foo">
</validate>

<validate name="external-valid" rules="allowed-links" allowed-links='{"allowExternal": false}'>
  <a href="./foo">
</validate>

### `allowRelative`

By setting `allowRelative` to `false` any link with a relative url will be disallowed.

<validate name="relative-invalid" rules="allowed-links" allowed-links='{"allowRelative": false}'>
  <a href="../foo">
</validate>

<validate name="relative-valid" rules="allowed-links" allowed-links='{"allowRelative": false}'>
  <a href="/foo">
</validate>

### `allowAbsolute`

By setting `allowAbsolute` to `false` any link with a absolute url will be disallowed.

<validate name="absolute-invalid" rules="allowed-links" allowed-links='{"allowAbsolute": false}'>
  <a href="/foo">
</validate>

<validate name="absolute-valid" rules="allowed-links" allowed-links='{"allowAbsolute": false}'>
  <a href="../foo">
</validate>

### `allowBase`

By setting `allowBase` to `false` relative urls can be used only if using an explicit path but not when relative to document base url.
This is useful when wanting to use relative urls but not rely on `<base href="..">` being set correctly.

Effectively this also means that links to files in the same folder must use `./target` even if `target` is valid.

<validate name="base-invalid" rules="allowed-links" allowed-links='{"allowBase": false}'>
  <a href="foo">
</validate>

<validate name="base-valid" rules="allowed-links" allowed-links='{"allowBase": false}'>
  <a href="./foo">
</validate>
