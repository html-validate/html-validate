---
docType: rule
name: element-required-ancestor
category: content-model
summary: Validate required ancestors
---

# Validate required ancestors (`element-required-ancestor`)

HTML defines requirements for required ancestors on certain elements.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="element-required-ancestor">
    <area>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="element-required-ancestor">
    <map>
        <area>
    </map>
</validate>

## Version history

- %version% - Rule added.
