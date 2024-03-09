---
docType: rule
name: area-alt
category: a11y
summary: Require alternative text on `<area>` elements
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Require alternative text on `<area>` elements

The `alt` attribute is used to provide an alternative text describing the area in the image map.
It is used both by the browser when the `<img>` source is missing but most of all it is used by screen readers and is a required technique for [WCAG H24][wcag-h24].

[wcag-h24]: https://www.w3.org/WAI/WCAG22/Techniques/html/H24

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="area-alt">
	<img src="image.png" usemap="#imagemap" alt="An awesome image">
	<map name="imagemap">
		<area href="target1.html">
		<area alt="Link purpose">
	</map>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="area-alt">
	<img src="image.png" usemap="#imagemap" alt="An awesome image">
	<map name="imagemap">
		<area href="target1.html" alt="Link purpose">
		<area href="target2.html" alt="Link purpose">
	</map>
</validate>

## Options

This rule takes an optional object:

```json
{
  "accessible": true
}
```

### `accessible`

The HTML5 standard allows only a single `<area>` element to contain alternative text when a group of `<area>` references the same resource.
WCAG requires all of them to be labeled even if referencing the same resource.
This is because HTML only considers the case when the image is missing and uses an algorithm to remove duplicated links pointing to the same resource, thus only requiring a single `<area>` for each resource to contain the `alt` text.
As for screen readers and accessibility each of the `<area>` elements could be read by the user and thus each of them must be adequate labeled.

This option is enabled by default by the `html-validate:recommended` and `html-validate:a11y` presets but disabled by the `html-validate:standard` preset.

With this option **enabled** the following is **incorrect**:

<validate name="enabled-a11y" rules="area-alt" area-alt='{ "accessible": true }'>
	<img src="image.png" usemap="#imagemap" alt="An awesome image">
	<map name="imagemap">
		<area href="target.html" alt="">
		<area href="target.html" alt="Link purpose">
	</map>
</validate>

With this option **disabled** the following is **correct**:

<validate name="disabled-a11y" rules="area-alt" area-alt='{ "accessible": false }'>
	<img src="image.png" usemap="#imagemap" alt="An awesome image">
	<map name="imagemap">
		<area href="target.html" alt="">
		<area href="target.html" alt="Link purpose">
	</map>
</validate>

## Version history

- 7.7.0 - Rule added.
