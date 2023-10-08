---
docType: content
title: Events
---

# Events

## Engine

### `config:ready`

```typescript nocompile
export interface ConfigReadyEvent {
  location: Location | null;
  config: ResolvedConfig;
  rules: Record<string, Rule<unknown, unknown>>;
}
```

Emitted after after configuration is ready but before DOM is initialized.

### `source:ready`

```typescript nocompile
export interface SourceReadyEvent {
  location: Location | null;
  source: Source;
}
```

Emitted after after source is transformed but before DOM is initialized.
See {@link api:Source} for data structure.

The source object must not be modified (use a transformer if modifications are required).
The `hooks` property is always unset.

### `token`

```typescript nocompile
export interface TokenEvent {
  location: Location | null;
  token: Token;
}
```

Emitted for each lexer token during parsing.

## Document

### `dom:load`

```typescript nocompile
export interface DOMLoadEvent {
  location: Location | null;
  source: Source;
}
```

Emitted after initialization but before tokenization and parsing occurs.
Can be used to initialize state in rules.

### `dom:ready`

```typescript nocompile
export interface DOMReadyEvent {
  location: Location | null;
  document: DOMTree;
  source: Source;
}
```

Emitted after the parsing has finished loading the DOM tree.

### `doctype`

```typescript nocompile
export interface DoctypeEvent {
  location: Location;
  tag: string;
  value: string;
  valueLocation: Location;
}
```

Emitted when a DOCTYPE is encountered.
`tag` is the tag used to open and `value` is the doctype value (without `<!doctype` and `>`).

`location` refers to the doctype opening tag and `valueLocation` to the value (as described above)

## DOM Nodes

```plaintext
                  attr                                     attr
tag:start         |  tag:ready           tag:start         |  tag:ready
   |              | /                       |              | /
   v              vv                        v              vv
<div class="foobar">                   <input class="foobar">
  ..                                                        ^
</div>                                                       \
     ^                                                        element:ready
     |\
     | element:ready                   (tag:end not emitted)
  tag:end
```

### `tag:start`

- Deprecated alias: `tag:open`

```typescript nocompile
export interface TagStartEvent {
  location: Location;
  target: HtmlElement;
}
```

Emitted when a start tag is parsed: `<div>`.

`target` will be newly created element.
The element will not have its attribute nor children yet.
Use `tag:ready` (all attributes parsed) or `element:ready` (all children parsed) if you need to wait for element to be ready.

### `tag:end`

- Deprecated alias: `tag:close`

```typescript nocompile
export interface TagEndEvent {
  location: Location;
  target: HtmlElement | null;
  previous: HtmlElement;
}
```

Emitted when an end tag is parsed: `</div>`.
It is similar to `element:ready` but will not be emitted for `void` elements.

`target` refers to the close-tag itself and `previous` is the current active element about to be closed.

### `tag:ready`

```typescript nocompile
export interface TagReadyEvent {
  location: Location;
  target: HtmlElement;
}
```

Emitted when a start tag is finished parsing (i.e. the node and all attributes are consumed by the parser).

`target` will be the element.
The children will not yet be parsed.

### `element:ready`

```typescript nocompile
export interface ElementReadyEvent {
  location: Location;
  target: HtmlElement;
}
```

Emitted when an element is fully constructed (including its children).
It is similar to `tag:end` but will be emitted for `void` elements as well.

`target` will be the element.

### `attr`

```typescript nocompile
export interface AttributeEvent {
  location: Location;
  key: string;
  value: string | DynamicValue | null;
  quote: '"' | "'" | null;
  originalAttribute?: string;
  target: HtmlElement;
  keyLocation: Location;
  valueLocation: Location | null;
  meta: MetaAttribute | null;
}
```

Emitted when an element attribute is parsed: `<div foo="bar">`.

Target node will not have been updated with the new attribute yet (e.g. `node.getAttribute(...)` will return `undefined` or a previous value).

`originalAttribute` is set when a transformer has modified the attribute and contains the original attribute name, e.g. `ng-class` or `v-bind:class`.

If the element have metadata for the specific attribute it will be present in the `meta` property.

## Misc

### `whitespace`

```typescript nocompile
export interface WhitespaceEvent {
  location: Location;
  text: string;
}
```

Emitted when inter-element, leading and trailing whitespace is parsed.

### `conditional`

```typescript nocompile
export interface ConditionalEvent {
  location: Location;
  condition: string;
  parent: HtmlElement | null;
}
```

Emitted when a conditional comment `<![conditional]>` is parsed.
The parser ignores and condition and run all possible branches but raises the event for any rules that wishes to do anything with it.
