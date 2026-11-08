---
docType: content
title: API - Rule
id: api:Rule
name: Rule
nav: devguide
---

# `Rule` class

Base class for rules.

## `isValidAriaRole()` method

```ts nocompile nolint
isValidAriaRole(role: string): role is AriaRole;
```

Returns `true` if the role is defined in the configured ARIA specification version.
When `true`, the argument is narrowed to `AriaRole`.

## `getAriaRoleData()` method

```ts nocompile nolint
getAriaRoleData(role: AriaRole): NormalizedRole;
getAriaRoleData(role: string): NormalizedRole | null;
```

Returns metadata for the role, or `null` if the role is not defined in the configured version.
Validate a string with `isValidAriaRole()` before looking up its metadata to use the non-null overload.
