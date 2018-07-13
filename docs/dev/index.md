@ngdoc content
@module usage
@name Developers guide
@description

Developers guide
================

Rules
-----

Rules are created by extending the `Rule` class and implementing the `setup`
method:

```typescript
class MyRule extends Rule {
  setup(){
    /* listen on dom ready event */
    this.on('dom:ready', (event: DOMReadyEvent) => {
      /* do something with the DOM tree */
      const buttons = event.document.getElementsByTagName('button');

      /* report a new error */
      this.report(buttons[0], "Button are not allowed");
    });
  }
}

module.exports = MyRule;
```

Events
------

`dom:load`
----------

```typescript
{}
```

Emitted after initialization but before tokenization and parsing occurs. Can be
used to initialize state in rules.

`dom:ready`
-----------

```typescript
{
  document: DOMTree,
}
```

Emitted after the parsing has finished loading the DOM tree.

`doctype`
-----------

```typescript
{
  value: string,
}
```

Emitted when a doctype is encountered. `value` is the doctype (without
`<doctype` and `>`).

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
