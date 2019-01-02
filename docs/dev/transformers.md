@ngdoc content
@module dev
@name Transformers
@description

# Transformers

### `TemplateExtractor`

Extracts templates from javascript sources.

```
const TemplateExtractor = require('html-validate').TemplateExtractor;
const te = TemplateExtractor.fromFilename("my-file.js");

/* finds any {template: '...'} */
const source = te.extractObjectProperty('template');
```
