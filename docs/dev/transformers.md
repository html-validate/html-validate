@ngdoc content
@module dev
@name Transformers
@description

# Transformers

### `TemplateExtractor`

Extracts templates from javascript sources.

```typescript
const TemplateExtractor = require("html-validate").TemplateExtractor;
const te = TemplateExtractor.fromFilename("my-file.js");

/* finds any {template: '...'} */
const source = te.extractObjectProperty("template");
```

### Source hooks

Transformers can add hooks for additional processing by setting `source.hooks`:

```typescript
function processAttribute(
  attr: AttributeData
): IterableIterator<AttributeData> {
  /* handle attribute */
}

function processElement(node: HtmlElement): void {
  /* handle element */
}

source.hooks = {
  processAttribute,
  processElement,
};
```

#### `processAttribute`

Called before an attribute is set on `HtmlElement` and can be used to modify
both the key and value. If the attribute is processed with scripting
(e.g. databinding) the value may be replaced with `DynamicValue`.

#### `processElement`

Called after element is fully created but before children are parsed. Can be
used to manipluate elements (e.g. add dynamic text from frameworks).
