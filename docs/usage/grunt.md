---
docType: content
title: Grunt task
nav: userguide
---

# Grunt task

    npm install --save-dev grunt-html-validate

## Usage

```js nocompile
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
