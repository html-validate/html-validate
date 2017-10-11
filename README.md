# html-validate

Offline HTML5 validator. Validates either a full document or a smaller
(incomplete) template, e.g. from an AngularJS or React component.

## Features

- Can test fragments of HTML, for instance a component template.
- Does not upload any data to a remote server, all testing is done locally.

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

    npm run mocha
