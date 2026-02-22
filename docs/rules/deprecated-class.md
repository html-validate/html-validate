---
docType: rule
name: deprecated-class
category: deprecated
summary: Disallow usage of deprecated CSS classes
---

# Disallow usage of deprecated CSS classes

Disallows usage of configurable CSS class names that have been marked as deprecated.

By default, the list of deprecated classes is empty and must be configured by the user.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="deprecated-class" deprecated-class='{ "classes": [{ "class": "old-btn" }, { "class": "legacy-grid" }] }'>
	<button class="old-btn">Click me</button>
	<div class="legacy-grid">Content</div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="deprecated-class" deprecated-class='{ "classes": [{ "class": "old-btn" }] }'>
	<button class="new-btn">Click me</button>
	<div class="modern-layout">Content</div>
</validate>

## Options

This rule takes an optional object:

```json
{
  "classes": []
}
```

### `classes`

List of deprecated CSS class names.

Each entry is an object with the following properties:

- `class`: name of the deprecated CSS class.
- `message`: optional message to display.
- `replacement`: optional replacement class name (`string`) or list of class names (`string[]`)
- `url`: optional URL with further details.

Configuring the same class name more than once produces unpredictable results.

Example configuration:

```json config
{
  "rules": {
    "deprecated-class": [
      "error",
      {
        "classes": [
          {
            "class": "old-btn",
            "message": "Use the new button component instead",
            "replacement": "btn-primary",
            "url": "https://example.com/design-system/buttons"
          },
          {
            "class": "legacy-grid",
            "replacement": "grid-modern"
          },
          {
            "class": "float-left"
          }
        ]
      }
    ]
  }
}
```

## Version history

- %version% - Rule added.
