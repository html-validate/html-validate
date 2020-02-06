---
docType: content
title: Writing rules
---

# Writing rules

Rules are created by extending the `Rule` class and implementing the `setup`
method:

```typescript
import { Rule, RuleDocumentation } from "html-validate";

class MyRule extends Rule {
  documentation(): RuleDocumentation {
    return {
      description: "Lorem ipsum",
      url: "https://example.net/best-practice/my-rule.html",
    };
  }

  setup(): void {
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

All (enabled) rules run the `setup()` callback before the source document is being parsed and is used to setup any event listeners relevant for this rule.
Many rules will use the `dom:ready` event to wait for the full DOM document to be ready but many other events are available, see {@link dev/events events} for a full list.

To report an error the rule uses the `report()` method with the DOM node and an error message.
Rules does not have to consider the severity or whenever the rule is enabled or not.
The message should be short and concise but still contain enough information to allow the user to understand what is wrong and why.

For a more verbose error (typically shown in IDEs and GUIs) the `documentation()` method is used.
This documentation might include contextual information (see below).

## Error location

By default the error is reported at the same location as the DOM node but if a better location can be provided it should be added as the third argument, typically by using the provided `sliceLocation` helper:

```typescript
/* recommended: move start location by 5 characters */
const location = sliceLocation(node.location, 5);

/* not recommended: construct location manually */
const location = {
  filename: node.location.filename,
  line: 1,
  column: 2,
  offset: 1,
  size: 5,
};

this.on(node, "asdf", location);
```

## Error context

Error messages may optionally include additional context.
Most CLI formatters will not include the context but JSON output and when using the API gives access to the contextual data.
This is very useful for IDE support as the short regular message might not always include enough information about why something is not allowed in a particular case.

The most important difference is that the context object is passed to the `documentation` method and can be used to give a better description of the error.

```typescript
interface RuleContext {
  tagname: string;
  allowed: string[];
}

class MyRule extends Rule<RuleContext> {
  /* documentation callback now accepts the optional context as first argument */
  documentation(context?: RuleContext): RuleDocumentation {
    /* setup the default documentation object (used when no context is available) */
    const doc: RuleDocumentation = {
      description: "This element cannot be used here.",
      url: "https://example.net/my-rule",
    };

    /* if a context was passed include a better description */
    if (context) {
      const tagname = context.tagname;
      const allowed = context.allowed.join(", ");
      doc.description = `The ${tagname} element cannot be used here, only one of ${allowed} is allowed.`;
    }

    return doc;
  }

  setup(): void {
    /* actual setup code left out for brevity */

    /* create a context object for this error */
    const context: RuleContext = {
      tagname: node.tagName,
      allowed: ["<b>", "<i>", "<u>"],
    };

    /* pass the context when reporting an error */
    this.report(node, "This element cannot be used here", null, context);
  }
}
```

<div class="alert alert-info">
	<i class="fa fa-info-circle" aria-hidden="true"></i>
	<strong>Note</strong>
	<p>Even if your rule reports contextual data the API user might not pass it back to the <code>documentation()</code> call so you must always test if the context object was actually passed or not.</p>
</div>

## Options

If the rule has options create an interface and pass as the second template argument.
Options can either be accessed in the class constructor or on `this.options`.
If any option is required be use to include defaults as the use must not be required to enter any options in their configuration.

```typescript
interface RuleOptions {
  text: string;
}

const defaults: RuleOptions = {
  text: "lorem ipsum",
};

class MyRule extends Rule<void, RuleOptions> {
  constructor(options: RuleOptions) {
    /* assign default values if not provided by user */
    super(Object.assign({}, defaults, options));
  }

  setup(): void {
    /* actual setup code left out for brevity */

    /* disallow the node from containing the text provided in the option */
    if (node.textContent.inclues(this.options.text)) {
      this.report(node, "Contains disallowed text");
    }
  }
}
```

## API

### `options: RuleOptions`

Object with all the options passed from the configuration.
Options are accessed using `this.options`.

When using typescript: pass the datatype as the second template argument when extending `Rule`.
Default is `void` (i.e. no options)

### `on(event: string, callback: (event: Event)): void`

Listen for events. See [events](/dev/events.html) for a full list of available
events and data.

### `report(node: DOMNode, message: string, location?: Location, context?: RuleContext): void`

Report a new error.

- `node` - The `DOMNode` this error belongs to.
- `message` - Error message
- _`location`_ - If set it is the precise location of the error. (Default: node
  location)
- _`context`_ - If set it will be passed to `documentation()` later to allow
  retrieving contextual documentation.

### `getTagsWithProperty(propName: MetaLookupableProperty): string[]`

Find all tags which has enabled given property.

### `getTagsDerivedFrom(tagName: string): string[]`

Find tag matching tagName or inheriting from it.
