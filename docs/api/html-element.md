---
docType: content
title: API - HtmlElement
id: api:HtmlElement
name: HtmlElement
nav: devguide
---

# `HtmlElement`

## `ownerDocument` property

- since: 11.23.0

Returns the document root that owns this element, or `null` if the element has no owner.
The document root itself returns `null`.

### Syntax

```ts nocompile nolint
readonly ownerDocument: HtmlElement | null
```
