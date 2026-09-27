---
docType: content
title: Grunt task
nav: userguide
---

# Grunt task

```bash
npm install --save-dev grunt-html-validate
```

## Usage

```ts nocompile
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

```bash
grunt htmlvalidate
```
