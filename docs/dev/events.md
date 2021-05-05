---
docType: content
title: Events
---

# Events

## Engine

### `config:ready`

```typescript
{
  config: ConfigData;
  rules: { [ruleId: string]: Rule };
}
```

Emitted after after configuration is ready but before DOM is initialized.

### `source:ready`

```typescript
{
  source: Source;
}
```

Emitted after after source is transformed but before DOM is initialized.
See {@link api:Source} for data structure.

The source object must not be modified (use a transformer if modifications are required).
The `hooks` property is always unset.

### `token`

```typescript
interface TokenEvent {
  location: Location;
  type: TokenType;
  data?: any;
}
```

Emitted for each lexer token during parsing.

## Document

### `dom:load`

```typescript
{
  source: Source;
}
```

Emitted after initialization but before tokenization and parsing occurs.
Can be used to initialize state in rules.

### `dom:ready`

```typescript
{
  document: DOMTree,
  source: Source;
}
```

Emitted after the parsing has finished loading the DOM tree.

### `doctype`

```typescript
interface DoctypeEvent {
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

```typescript
{
  target: Node,
}
```

Emitted when a start tag is parsed: `<div>`.

`target` will be newly created element.
The element will not have its attribute nor children yet.
Use `tag:ready` (all attributes parsed) or `element:ready` (all children parsed) if you need to wait for element to be ready.

### `tag:end`

- Deprecated alias: `tag:close`

```typescript
{
  target: Node,
  previous: Node,
}
```

Emitted when an end tag is parsed: `</div>`.
It is similar to `element:ready` but will not be emitted for `void` elements.

`target` refers to the close-tag itself and `previous` is the current active element about to be closed.

### `tag:ready`

```typescript
{
  target: Node,
}
```

Emitted when a start tag is finished parsing (i.e. the node and all attributes are consumed by the parser).

`target` will be the element.
The children will not yet be parsed.

### `element:ready`

```typescript
{
  target: Node,
}
```

Emitted when an element is fully constructed (including its children).
It is similar to `tag:end` but will be emitted for `void` elements as well.

`target` will be the element.

### `attr`

```typescript
{
  target: Node,
  location: Location,
  valueLocation: Location,
  key: String,
  value: String|undefined,
  quote: 'single'|'double'|undefined,
  originalAttribute: string;
}
```

Emitted when an element attribute is parsed: `<div foo="bar">`.

Target node will not have been updated with the new attribute yet (e.g. `node.getAttribute(...)` will return `undefined` or a previous value).

`originalAttribute` is set when a transformer has modified the attribute and contains the original attribute name, e.g. `ng-class` or `v-bind:class`.

## Misc

### `whitespace`

```typescript
{
  text: string;
}
```

Emitted when inter-element, leading and trailing whitespace is parsed.

### `conditional`

```typescript
{
  condition: string;
}
```

Emitted when a conditional comment `<![conditional]>` is parsed. The parser
ignores and condition and run all possible branches but raises the event for any
rules that wishes to do anything with it.
