---
docType: content
title: Grunt task
---

# Grunt task

    npm install --save-dev grunt-html-validate

## Usage

```js
require("load-grunt-tasks")(grunt);

grunt.initConfig({
  htmlvalidate: {
    default: {
      src: ["file.html"],
    },
  },
});
```

Run with

    grunt htmlvalidate
