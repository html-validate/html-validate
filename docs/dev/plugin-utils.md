---
docType: content
title: Transformers
name: plugin-utils
nav: devguide
---

# `@html-validate/plugin-utils`

Plugin utilities and helpers for writing plugins to HTML-Validate

> npm install --save-dev @html-validate/plugin-utils

## API

```ts nocompile
import { Source } from "html-validate";

export interface Position {
  column: number;
  line: number;
}

export function positionFromOffset(text: string, offset: number): [line: number, column: number];

export function positionToOffset(position: Position, data: string): number;

export class TemplateExtractor {
  static fromString(source: string, filename?: string): TemplateExtractor;
  extractObjectProperty(key: string): Source[];
}
```

## Usage

### `TemplateExtractor`

Extracts HTML-snippets from Javascript based files.

```ts nocompile
import { TemplateExtractor } from "@html-validate/plugin-utils";

/* javascript with HTML in the "template" property */
const sourceCode = `
  export default {
    template: "<p>lorem ipsum</i>",
  }
`;

/* extract HTML snippets */
const templateExtractor = TemplateExtractor.fromString(sourceCode);
const snippets = templateExtractor.extractObjectProperty("template");
```

Typically used in a transformation plugin to but it could also be validated directly:

```ts nocompile
for (const snippet of snippets) {
  const result = htmlvalidate.validateSource(snippet);
  console.log(result);
}
```
