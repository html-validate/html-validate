@ngdoc content
@module dev
@name Transformers
@description

# Transformers

## API

Each transformer must implement the following API:

```typescript
import { Transformer, TransformContext } from "html-validate";

module.exports = function(
  this: TransformContext,
  source: Source
): Iterable<Source> {
  /* ... */
};
```

### `TransformContext`

```typescript
export interface TransformContext {
  chain(source: Source, filename: string): Iterable<Source>;
}
```

#### `chain`

Chain transformations. Sometimes multiple transformers must be applied. For
instance, a Markdown file with JSX in a code-block.

```typescript
for (const source of myTransformation()) {
  yield * this.chain(source, `${originalFilename}.foo`);
}
```

The above snippet will chain transformations using the current transformer
matching `*.foo` files, if it is configured.

## `TemplateExtractor`

Extracts templates from javascript sources.

```typescript
const TemplateExtractor = require("html-validate").TemplateExtractor;
const te = TemplateExtractor.fromFilename("my-file.js");

/* finds any {template: '...'} */
const source = te.extractObjectProperty("template");
```

## Source hooks

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

### `processAttribute`

Called before an attribute is set on `HtmlElement` and can be used to modify
both the key and value. If the attribute is processed with scripting
(e.g. databinding) the value may be replaced with `DynamicValue`.

### `processElement`

Called after element is fully created but before children are parsed. Can be
used to manipluate elements (e.g. add dynamic text from frameworks).
