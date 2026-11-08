---
docType: content
title: API - Rule
id: api:Rule
name: Rule
nav: devguide
---

# `Rule` class

Base class for rules.

## `options` property

### Syntax {#options-syntax}

```ts nocompile nolint
readonly options: OptionsType
```

Object with all the options passed from the configuration.
Options are accessed using `this.options`.

When using TypeScript, pass the datatype as the second template argument when extending `Rule`.
The default is `void` (i.e. no options).

## `on()` method

Listen for events.
See the {@link dev/events events guide} for a full list of available events and data.

If `filter` is passed, the callback is only called if the filter function evaluates to `true`.

### Syntax {#on-syntax}

```ts nocompile nolint
on<K extends keyof ListenEventMap>(event: K, callback: (event: ListenEventMap[K]) => void): () => void;
on<K extends keyof ListenEventMap>(event: K, filter: (event: ListenEventMap[K]) => boolean, callback: (event: ListenEventMap[K]) => void): () => void;
```

### Return value {#on-return-value}

A function to unregister the event listener.

### Parameters {#on-parameters}

- `event`: Event name.
- `callback`: Function called when the event is delivered.
- `filter`: Optional function; the callback is only called when the filter returns `true`.

## `report()` method

Report a new error.

### Syntax {#report-syntax}

```ts nocompile nolint
report(error: ErrorDescriptor<ContextType>): void;
```

### Return value {#report-return-value}

No return value.

### Parameters {#report-parameters}

- `error.node: DOMNode | null`: The node the error belongs to.
- `error.message: string`: Error message.
- `error.location?: Location | null`: Optional precise location of the error (defaults to the node location).
- `error.context?: ContextType`: Optional data passed to `documentation()` to provide contextual documentation.
- `error.related?`: Optional list of related elements, each with `kind: "element"` and a `DOMNode | null` node; may be `null`.
- `error.fix?`: Optional callback receiving an `ErrorFixer` to automatically fix the error; may be `null`.
- `error.suggestions?`: Optional list of suggested fixes, each with a message and an `ErrorFixer` callback; may be `null`.

## `getMetaFor()` method

### Syntax {#getmetafor-syntax}

```ts nocompile nolint
getMetaFor(tagName: string): MetaElement | null
```

### Return value {#getmetafor-return-value}

Metadata for the tag, or `null` if neither tag-specific nor global metadata exists.

### Parameters {#getmetafor-parameters}

- `tagName`: Tag name to look up.

## `getTagsWithProperty()` method

### Syntax {#gettagswithproperty-syntax}

```ts nocompile nolint
getTagsWithProperty(propName: MetaLookupableProperty): string[]
```

### Return value {#gettagswithproperty-return-value}

Names of all tags with the given property enabled.

### Parameters {#gettagswithproperty-parameters}

- `propName`: Metadata property to look up.

## `getTagsDerivedFrom()` method

### Syntax {#gettagsderivedfrom-syntax}

```ts nocompile nolint
getTagsDerivedFrom(tagName: string): string[]
```

### Return value {#gettagsderivedfrom-return-value}

Names of tags matching `tagName` or inheriting from it.

### Parameters {#gettagsderivedfrom-parameters}

- `tagName`: Tag name to match or inherit from.

## `isValidAriaRole()` method

### Syntax {#isvalidariarole-syntax}

```ts nocompile nolint
isValidAriaRole(role: string): role is AriaRole;
```

### Return value {#isvalidariarole-return-value}

Returns `true` if the role is defined in the configured ARIA specification version.
When `true`, the argument is narrowed to `AriaRole`.

### Parameters {#isvalidariarole-parameters}

- `role`: Role name to check.

## `getAriaRoleData()` method

### Syntax {#getariaroledata-syntax}

```ts nocompile nolint
getAriaRoleData(role: AriaRole): NormalizedRole;
getAriaRoleData(role: string): NormalizedRole | null;
```

### Return value {#getariaroledata-return-value}

Metadata for the role, or `null` if the role is not defined in the configured version.

### Parameters {#getariaroledata-parameters}

- `role`: Role name to look up; validate a string with `isValidAriaRole()` first to narrow it to `AriaRole` for the non-null overload.
