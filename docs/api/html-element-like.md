---
docType: content
title: API - HtmlElementLike
id: api:HtmlElementLike
name: HtmlElementLike
nav: devguide
---

# `HtmlElementLike`

Metadata callbacks receive an `HtmlElementLike` representing the element being evaluated.
It exposes a subset of the browser element API.

## `closest()` method

Finds the element itself or its nearest matching ancestor.

### Syntax {#closest-syntax}

```ts nocompile nolint
closest(selectors: string): HtmlElementLike | null | undefined
```

### Return value {#closest-return-value}

The element itself or its nearest matching ancestor, or `null`/`undefined` if none matches.

### Parameters {#closest-parameters}

- `selectors`: Selector list to match.

## `getAttribute()` method

Returns the value of the named attribute, or a nullish value if the attribute is absent.
Dynamic attributes may return a `DynamicValue`.

### Syntax {#getattribute-syntax}

```ts nocompile nolint
getAttribute(name: string): string | DynamicValue | null | undefined
```

### Return value {#getattribute-return-value}

The attribute value, a `DynamicValue` for dynamic attributes, or `null`/`undefined` if absent.

### Parameters {#getattribute-parameters}

- `name`: Attribute name.

## `hasAttribute()` method

Returns whether the named attribute is present.

### Syntax {#hasattribute-syntax}

```ts nocompile nolint
hasAttribute(name: string): boolean
```

### Return value {#hasattribute-return-value}

`true` if the attribute is present, otherwise `false`.

### Parameters {#hasattribute-parameters}

- `name`: Attribute name.

## `matches()` method

- since: %version%

Tests whether this element matches the selector list, including selectors that describe its context (for example, `section > my-component`).

### Syntax {#matches-syntax}

```ts nocompile nolint
matches(selectors: string): boolean
```

### Return value {#matches-return-value}

`true` if this element matches the selector list, otherwise `false`.

### Parameters {#matches-parameters}

- `selectors`: Selector list to match against this element.
