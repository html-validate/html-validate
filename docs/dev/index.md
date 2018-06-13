@ngdoc content
@module usage
@name Developers guide
@description

Developers guide
================

Events
------

`tag:open`
----------

```typescript
{
  target: Node,
}
```

Emitted when an opening element is parsed: `<div>`. `target` will be
newly created Node.

`tag:close`
-----------

```typescript
{
  target: Node,
  previous: Node,
}
```

Emitted when a closing element is parsed: `</div>`. `target` refers to
the close-element itself and `previous` is the current active element
about to be closed.

`attr`
------

```typescript
{
  target: Node,
  key: String,
  value: String|undefined,
  quote: 'single'|'double'|undefined,
}
```

Emitted when an element attribute is parsed: `<div foo="bar">`.

Target node will not have been updated with the new attribute yet
(e.g. `node.getAttribute(...)` will return `undefined` or a previous
value).

`whitespace`
------------

```typescript
{
  text: string
}
```

Emitted when inter-element, leading and trailing whitespace is parsed.

`conditional`
-------------

```typescript
{
  condition: string
}
```

Emitted when a conditional comment `<![conditional]>` is parsed. The parser
ignores and condition and run all possbile branches but raises the event for any
rules that wishes to do anything with it.

Transformers
------------

### `TemplateExtractor`

Extracts templates from javascript sources.

```
const TemplateExtractor = require('html-validate').TemplateExtractor;
const te = TemplateExtractor.fromFilename("my-file.js");

/* finds any {template: '...'} */
const source = te.extractObjectProperty('template');
```
