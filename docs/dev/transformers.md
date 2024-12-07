---
docType: content
title: Transformers
nav: devguide
---

# Transformers

See also the {@link plugin-utils} package for utility functions.

## API

Each transformer must implement the following API:

```ts
import { Source, TransformContext } from "html-validate";

/* implementation */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export function myTransform(this: TransformContext, source: Source): Iterable<Source> {
  /* ... */
  return [];
}

/* api version declaration */
myTransform.api = 1;

/* export transformer */
export default myTransform;
```

### `TransformContext`

```typescript
import { Source } from "html-validate";

/* --- */

export interface TransformContext {
  hasChain(filename: string): boolean;
  chain(source: Source, filename: string): Iterable<Source> | Promise<Iterable<Source>>;
}
```

#### `chain`

Chain transformations. Sometimes multiple transformers must be applied.
For instance, a Markdown file with JSX in a code-block.

```ts
import { Source, TransformContext } from "html-validate";

function transformImplementation(_source: Source): Iterable<Source> {
  return [];
}

/* --- */

export async function myTransform(
  this: TransformContext,
  source: Source,
): Promise<Iterable<Source>> {
  const sources = [];
  for (const transformedSource of transformImplementation(source)) {
    const next = `${source.filename}.foo`;
    for (const chained of await this.chain(transformedSource, next)) {
      sources.push(chained);
    }
  }
  return sources;
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

```json
{
  "transform": {
    "^.*\\.foo$": "my-transformer",
    "^.*:virtual$": "my-other-transformer"
  }
}
```

`my-transformer` can then implement the following pattern:

```ts
import { Source, TransformContext } from "html-validate";

/* --- */

export function myTransform(
  this: TransformContext,
  source: Source,
): Iterable<Source> | Promise<Iterable<Source>> {
  /* create a virtual filename */
  const next = `${source.filename}:virtual`;
  if (this.hasChain(next)) {
    return this.chain(source, next);
  } else {
    return [source];
  }
}
```

By letting the user configure the `.*:virtual` pattern the user can control whenever `my-transformer` will yield a source for the match or not.
This is useful when the transformer needs to deal with multiple languages and the user should ultimately be able to control whenever a language should be validated by HTML-validate or not.

## Source

The validator engine works on a `Source` object.
A transformer take a source object as argument and returns zero or more new sources.

```typescript
import { SourceHooks } from "html-validate";

/* --- */

export interface Source {
  data: string;
  filename: string;
  line: number;
  column: number;
  offset: number;
  originalData?: string;
  hooks?: SourceHooks;
}
```

The `data` property is the markup/source code for the source object.
Since the `data` property might be only a small part of the original file there is also the related property `originalData` which is the full markup/source code of the file.
`line`, `column` and `offset` is the starting location of the `data` relative to `originalData`.
Line and column start at 1 and offset start at 0.
`filename` is always the original filename.
If the transformer wants to apply hooks for later processing they are set directly on the `hooks` property.
Hooks should only be added in the last transformer, if chaining is used the hook might be overwritten or ignored.

## Source hooks

Transformers can add hooks for additional processing by setting `source.hooks`:

```ts nocompile
import { AttributeData, HtmlElement } from "html-validate";

function processAttribute(attr: AttributeData): IterableIterator<AttributeData> {
  /* handle attribute */
  return [];
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
used to manipulate elements (e.g. add dynamic text from frameworks).
