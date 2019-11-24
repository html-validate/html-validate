@ngdoc content
@module dev
@name Transformers
@description

# Transformers

## API

Each transformer must implement the following API:

```typescript
import { Transformer, TransformContext } from "html-validate";

/* implementation */
function myTransform(this: TransformContext, source: Source): Iterable<Source> {
  /* ... */
}

/* api version declaration */
myTransform.api = 1;

/* export */
module.exports = myTransform as Transfomer;
```

### `TransformContext`

```typescript
export interface TransformContext {
  hasChain(filename: string): boolean;
  chain(source: Source, filename: string): Iterable<Source>;
}
```

#### `chain`

Chain transformations. Sometimes multiple transformers must be applied.
For instance, a Markdown file with JSX in a code-block.

```typescript
for (const source of myTransformation()) {
  yield * this.chain(source, `${originalFilename}.foo`);
}
```

The above snippet will chain transformations using the current transformer matching `*.foo` files, if it is configured.

If no pattern matches the filename the input source is returned unmodified.
Use `hasChain` to test if chaining is present.

#### `hasChain`

Test if an additional chainable transformer is present.
Returns true only if there is a transformer configured for the given filename.

While it is always safe to call `chain(..)` as it will passthru sources without a chainable transform it is sometimes desirable to control whenever a `Source` should be yielded or not by determining if the user has configured a transformer or not.

Given a configuration such as:

```js
"transform": {
  "^.*\\.foo$": "my-transformer"
  "^.*:virtual$": "my-other-transformer"
}
```

`my-transformer` can then implement the following pattern:

```typescript
/* create a virtual filename */
const next = `${source.filename}:virtual`;
if (this.hasChain(next)) {
  yield * this.chain(source, next);
}
```

By letting the user configure the `.*:virtual` pattern the user can control whenever `my-transformer` will yield a source for the match or not.
This is useful when the transformer needs to deal with multiple languages and the user should ultimately be able to control whenever a language should be validated by HTML-validate or not.

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
