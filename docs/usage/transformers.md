---
docType: content
title: Transformers
nav: userguide
---

# Transformers

Transformers extracts HTML chunks from arbitrary input files, i.e. when the file
is not a pure HTML file. Commonly this would be a javascript file with
templating.

## List of official transformers

- [html-validate-angular]: transforms AngularJS components and routes with inline templates.
- [html-validate-vue]: transforms Vue.js sources. Extracts `<template>` from single file components and
  ``template: `...``` strings from javascript files.

[html-validate-angular]: https://www.npmjs.com/package/html-validate-angular
[html-validate-vue]: https://www.npmjs.com/package/html-validate-vue

## List of third-party transformers

- [html-validate-markdown]: transforms code-fence blocks from markdown files.

[html-validate-markdown]: https://www.npmjs.com/package/html-validate-markdown
