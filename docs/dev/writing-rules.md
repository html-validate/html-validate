@ngdoc content
@module dev
@name Writing rules
@description

# Writing rules

Rules are created by extending the `Rule` class and implementing the `setup`
method:

```typescript
// for vanilla javascript
const Rule = require("html-validate").Rule;

// for typescript
import { Rule } from "html-validate/src/rule";

class MyRule extends Rule {
  documentation(context?: any) {
    return {
      description: "Lorem ipsum",
      url: "https://example.net/best-practice/my-rule.html",
    };
  }

  setup() {
    /* listen on dom ready event */
    this.on("dom:ready", (event: DOMReadyEvent) => {
      /* do something with the DOM tree */
      const buttons = event.document.getElementsByTagName("button");

      /* report a new error */
      this.report(buttons[0], "Button are not allowed");
    });
  }
}

module.exports = MyRule;
```

For typescript generics can also be used when inheriting to specify the type of
the contextual data:

```typescript
interface ContextualData {
    /* ... */
}

class MyRule extends Rule<ContextualData> {
  documentation(context?: ContextualData){ ... }

  setup(){
    const context: ContextualData = { .. };
    this.report(node, "Message", null, context);
  }
}
```

## API

### `options: {[key: string]: any}`

Object with all the options passed from the configuration.

### `on(event: string, callback: (event: Event)): void`

Listen for events. See [events](/dev/events.html) for a full list of available
events and data.

### `report(node: HtmlElement, message: string, location?: Location, context?: T): void`

Report a new error.

- `node` - The `HtmlElement` this error belongs to.
- `message` - Error message
- _`location`_ - If set it is the precise location of the error. (Default: node
  location)
- _`context`_ - If set it will be passed to `documentation()` later to allow
  retrieving contextual documentation.
