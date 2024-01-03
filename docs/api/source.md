---
docType: content
title: API - Source
id: api:Source
name: Source
nav: false
---

# `Source`

Source interface.

HTML source with file, line and column context.

Optional hooks can be attached.
This is usually added by transformers to postprocess.

```ts
import { SourceHooks } from "html-validate";

/* --- */

export interface Source {
  data: string;
  filename: string;

  /**
   * Line in the original data.
   *
   * Starts at 1 (first line).
   */
  line: number;

  /**
   * Column in the original data.
   *
   * Starts at 1 (first column).
   */
  column: number;

  /**
   * Offset in the original data.
   *
   * Starts at 0 (first character).
   */
  offset: number;

  /**
   * Original data. When a transformer extracts a portion of the original source
   * this must be set to the full original source.
   *
   * Since the transformer might be chained always test if the input source
   * itself has `originalData` set, e.g.:
   *
   * `originalData = input.originalData || input.data`.
   */
  originalData?: string;

  /**
   * Hooks for processing the source as it is being parsed.
   */
  hooks?: SourceHooks;

  /**
   * Internal property to keep track of what transformers has run on this
   * source. Entries are in reverse-order, e.g. the last applied transform is
   * first.
   */
  transformedBy?: string[];
}
```

## `SourceHooks`

```ts
import { ProcessAttributeCallback, ProcessElementCallback } from "html-validate";

/* --- */

export interface SourceHooks {
  /**
   * Called for every attribute.
   *
   * The original attribute must be yielded as well or no attribute will be
   * added.
   *
   * @returns Attribute data for an attribute to be added to the element.
   */
  processAttribute?: ProcessAttributeCallback | null;

  /**
   * Called for every element after element is created but before any children.
   *
   * May modify the element.
   */
  processElement?: ProcessElementCallback | null;
}
```
