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

```
{
  target: Node,
}
```

Emitted when an opening element is parsed: `<div>`. `target` will be
newly created Node.

`tag:close`
-----------

```
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

```
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
