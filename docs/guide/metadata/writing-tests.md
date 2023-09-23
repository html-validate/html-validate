---
docType: content
title: Writing tests for custom elements
---

# Writing tests for custom elements

Writing tests is as simple as using the HTML-Validate API configured with the metadata file.
The following example is using Jest but would be similar in other testing frameworks.

```ts
import * as path from "node:path";
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate({
  root: true,
  elements: ["html5", path.join(__dirname, "elements.json")],
  extends: ["html-validate:recommended"],
});

it("should give error when using <div> as content", async () => {
  const markup = /* HTML */ `
    <my-component>
      <div>lorem ipsum</div>
    </my-component>
  `;
  const report = await htmlvalidate.validateString(markup);
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

```ts
import * as path from "node:path";
import { HtmlValidate } from "html-validate";
import "html-validate/jest";

const htmlvalidate = new HtmlValidate({
  root: true,
  elements: ["html5", path.join(__dirname, "elements.json")],
  extends: ["html-validate:recommended"],
});

it("should give error when using <div> as content", () => {
  const markup = /* HTML */ `
    <my-component>
      <div>lorem ipsum</div>
    </my-component>
  `;
  const report = htmlvalidate.validateString(markup);
  expect(report).toBeInvalid();
  expect(report).toHaveError(
    "element-permitted-content",
    "Element <div> is not permitted as content in <my-component>"
  );
});
```
