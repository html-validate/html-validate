## API Report File for "html-validate"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Source } from 'html-validate';
import { TransformContext } from 'html-validate';

// @public (undocumented)
type Transformer_2 = (this: TransformContext, source: Source) => Iterable<Source>;
export { Transformer_2 as Transformer }

// @public
export function transformFile(fn: Transformer_2, filename: string, chain?: (source: Source, filename: string) => Iterable<Source>): Source[];

// @public
export function transformSource(fn: Transformer_2, source: Source, chain?: (source: Source, filename: string) => Iterable<Source>): Source[];

// @public
export function transformString(fn: Transformer_2, data: string, chain?: (source: Source, filename: string) => Iterable<Source>): Source[];

// (No @packageDocumentation comment for this package)

```
