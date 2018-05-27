@ngdoc content
@module usage
@name Transformers
@description

# Transformers

Transformers extracts HTML chunks from arbitrary input files, i.e. when the file
is not a pure HTML file. Commonly this would be a javascript file with
templating.

## List of official transformers

- [html-validate-vue]: transforms Vue.js sources. Extracts `<template>` from single file components and
  ``template: `...``` strings from javascript files.

[html-validate-vue]: https://www.npmjs.com/package/html-validate-vue
