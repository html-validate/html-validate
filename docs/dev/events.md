@ngdoc content
@module dev
@name Events
@description

# Events

## `dom:load`

```typescript
{
}
```

Emitted after initialization but before tokenization and parsing occurs. Can be
used to initialize state in rules.

## `dom:ready`

```typescript
{
  document: DOMTree,
}
```

Emitted after the parsing has finished loading the DOM tree.

## `doctype`

```typescript
{
  value: string,
}
```

Emitted when a doctype is encountered. `value` is the doctype (without
`<doctype` and `>`).

## `tag:open`

```typescript
{
  target: Node,
}
```

Emitted when an opening element is parsed: `<div>`. `target` will be
newly created Node.

## `tag:close`

```typescript
{
  target: Node,
  previous: Node,
}
```

Emitted when a closing element is parsed: `</div>`. `target` refers to
the close-element itself and `previous` is the current active element
about to be closed.

## `attr`

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

Target node will not have been updated with the new attribute yet
(e.g. `node.getAttribute(...)` will return `undefined` or a previous
value).

`originalAttribute` is set when a transformer has modified the attribute and
contains the original attribute name, e.g. `ng-class` or `v-bind:class`.

## `whitespace`

```typescript
{
  text: string;
}
```

Emitted when inter-element, leading and trailing whitespace is parsed.

## `conditional`

```typescript
{
  condition: string;
}
```

Emitted when a conditional comment `<![conditional]>` is parsed. The parser
ignores and condition and run all possbile branches but raises the event for any
rules that wishes to do anything with it.
