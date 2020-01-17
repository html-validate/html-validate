---
docType: content
title: AngularJS
---

# Usage with AngularJS

    npm install html-validate-angular

[html-validate-angular](https://www.npmjs.com/package/html-validate-angular) is needed to transform `.html` and `.js` files using AngularJS.

Configure with:

```json
{
  "elements": ["html5"],
  "transform": {
    "^.*\\.js$": "html-validate-angular/js",
    "^.*\\.html$": "html-validate-angular/html"
  }
}
```
