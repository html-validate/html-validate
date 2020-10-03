---
docType: content
title: Writing tests for custom elements
---

# Writing tests for custom elements

Writing tests is as simple as using the HTML-Validate API configured with the metadata file.
The following example is using Jest but would be similar in other testing frameworks.

```js
const { HtmlValidate } = require("html-validate");
const path = require("path");

let htmlvalidate;

beforeEach(() => {
  htmlvalidate = new HtmlValidate({
    root: true,
    elements: ["html5", path.join(__dirname, "elements.json")],
    extends: ["html-validate:recommended"],
  });
});

it("should give error when using <div> as content", () => {
  const report = htmlvalidate.validateString("<my-component><div>lorem ipsum</div></my-component>");
  expect(report.valid).toBeFalsy();
  expect(report.errorCount).toEqual(1);
  expect(report.results[0].messages[0]).toMatchInlineSnapshot(`
    Object {
      "column": 16,
      "context": undefined,
      "line": 1,
      "message": "Element <div> is not permitted as content in <my-component>",
      "offset": 15,
      "ruleId": "element-permitted-content",
      "severity": 2,
      "size": 3,
    }
  `);
});
```

When using Jest in particular there are helper functions to make it even easier:

```js
require("html-validate/build/matchers");

it("should give error when using <div> as content", () => {
  const report = htmlvalidate.validateString("<my-component><div>lorem ipsum</div></my-component>");
  expect(report).toBeInvalid();
  expect(report).toHaveError(
    "element-permitted-content",
    "Element <div> is not permitted as content in <my-component>"
  );
});
```
