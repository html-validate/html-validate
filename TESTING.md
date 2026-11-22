# Testing

## CDP

Chrome can optionally (opt-in) be used as an independent oracle to verify assumptions.
Enable them by setting `HTML_VALIDATE_CDP=1` when running Jest:

```bash
env HTML_VALIDATE_CDP=1 npx jest <test-file>
```

Import the internal matcher registration in the spec and compare the expected name with Chrome's result:

```ts
import { expect, it } from "@jest/globals";
import "../jest-internal";

it("Chrome accessible name", async () => {
  const markup = /* HTML */ ` <button>Save</button> `;
  await expect(markup).cdpAccessibleName("button", "Save");
});
```

Set `CHROME_BIN` if Chrome is not at `/opt/google/chrome/chrome`.
