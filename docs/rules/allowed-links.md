---
docType: rule
name: allowed-links
category: document
summary: Disallow link types
---

# Disallows link types

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
This can also be set to an object (see below regarding `include` and `exclude` lists).

<validate name="external-invalid" rules="allowed-links" allowed-links='{"allowExternal": false}'>
  <a href="http://example.net/foo">
</validate>

<validate name="external-valid" rules="allowed-links" allowed-links='{"allowExternal": false}'>
  <a href="./foo">
</validate>

### `allowRelative`

By setting `allowRelative` to `false` any link with a relative url will be disallowed.
This can also be set to an object (see below regarding `include` and `exclude` lists).

<validate name="relative-invalid" rules="allowed-links" allowed-links='{"allowRelative": false}'>
  <a href="../foo">
</validate>

<validate name="relative-valid" rules="allowed-links" allowed-links='{"allowRelative": false}'>
  <a href="/foo">
</validate>

### `allowAbsolute`

By setting `allowAbsolute` to `false` any link with a absolute url will be disallowed.
This can also be set to an object (see below regarding `include` and `exclude` lists).

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

### Using `include` and `exclude`

In addition to a boolean value `allowExternal`, `allowRelative` and `allowAbsolute` can also be set to an object with the `include` and `exclude` properties for a more fine-grained control of what link destinations should be considered valid.
Each property is a list of regular expressions matched against the link destination.

- When `include` is set each link must match at least one entry to be valid.
- When `exclude` is set each link must not match any entries to be valid.
- The two properties are not mutually exclusive, both can be enabled at the same time.

For instance, `allowExternal.include` can be used to set a whitelist of valid external links while disallowing all others.
In this case external links to `foo.example.net` is valid but any other would yield an error:

```json
{
  "allowExternal": {
    "include": ["^//foo.example.net"]
  }
}
```

<validate name="external-include" rules="allowed-links" allowed-links='{"allowExternal": {"include": ["^//foo.example.net"]}}'>
  <!-- allowed -->
  <a href="//foo.example.net">

  <!-- not allowed -->
  <a href="//bar.example.net">
</validate>

## Version history

- 6.1.0 - Added support for `include` and `exclude`.
