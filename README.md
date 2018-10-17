# html-validate

[![pipeline status](https://git.sidvind.com/html-validate/html-validate/badges/master/pipeline.svg)](https://git.sidvind.com/html-validate/html-validate/commits/master)
[![coverage report](https://git.sidvind.com/html-validate/html-validate/badges/master/coverage.svg)](https://git.sidvind.com/html-validate/html-validate/commits/master)

Offline HTML5 validator. Validates either a full document or a smaller
(incomplete) template, e.g. from an AngularJS or React component.

## Features

- Can test fragments of HTML, for instance a component template.
- Does not upload any data to a remote server, all testing is done locally.
- Strict and non-forgiving parsing. It will not try to correct any incorrect
  markup or guess what it should do.

## Usage

    npm install -g html-validate
    html-validate FILENAME..

## Configuration

Create `.htmlvalidate.json`:

```js
{
  "extends": [
    "htmlvalidate:recommended"
  ],

  "rules": {
    "close-order": "error"
    "void": ["warn", {"style": "omit"}]
  }
}
```

## Test

    npm test

## Lint

    npm run lint

## Build

   grunt build
   grunt docs
