@ngdoc content
@module dev
@name Writing rules
@description

Writing rules
=============

Rules are created by extending the `Rule` class and implementing the `setup`
method:

```
// for vanilla javascript
const Rule = require('html-validate').Rule;

// for typescript
import { Rule } from 'html-validate/src/rule';

class MyRule extends Rule {
  setup(){
    /* listen on dom ready event */
    this.on('dom:ready', (event: DOMReadyEvent) => {
      /* do something with the DOM tree */
      const buttons = event.document.getElementsByTagName('button');

      /* report a new error */
      this.report(buttons[0], "Button are not allowed");
    });
  }
}

module.exports = MyRule;
```

### API

#### `options: {[key: string]: any}`

Object with all the options passed from the configuration.

#### `on(event: string, callback: (event: Event)): void`

Listen for events. See [events](/dev/events.html) for a full list of available
events and data.

#### `report(node: DOMNode, message: string, location?: Location): void`

Report a new error.

- `node` - The `DOMNode` this error belongs to.
- `message` - Error message
- *`location`* - If set it is the precise location of the error. (Default: node
  location)
