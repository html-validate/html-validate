---
docType: rule
name: no-autoplay
category: a11y
summary: Disallow autoplaying media elements
standards:
  - wcag-2.2-a
  - wcag-2.1-a
  - wcag-2.0-a
---

# Disallow autoplaying media elements

Autoplaying content can be disruptive for users and has accessibility issues.
This rule disallows `<audio>` and `<video>` with autoplay enabled.

Unless the user is expecting media to play automatically it is better to let the user control playback.
The media might be too loud or the user might be in a location where audio is discouraged.

Users with assistive technology might find it hard to pause as they must first navigate to the controls.
Media can be distracting for users with cognitive or concentration issues and if the video contains flashing or blinking sequences it can cause epilepsy.

There are also issues where some browsers use heuristics to prevent autoplaying so results may vary when used.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-autoplay">
	<video autoplay></video>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="no-autoplay">
	<video></video>
</validate>

## Options

This rule takes an optional object:

```json
{
  "include": ["audio", "video"],
  "exclude": []
}
```

### `include`

If set only elements listed in this array generates errors.

### `exclude`

If set elements listed in this array is ignored.
