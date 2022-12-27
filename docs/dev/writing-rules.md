---
docType: content
title: Writing rules
---

# Writing rules

Rules are created by extending the `Rule` class and implementing the `setup`
method:

```ts
import { DOMReadyEvent, Rule, RuleDocumentation } from "html-validate";

export default class MyRule extends Rule {
  public documentation(): RuleDocumentation {
    return {
      description: "Lorem ipsum",
      url: "https://example.net/best-practice/my-rule.html",
    };
  }

  public setup(): void {
    /* listen on dom ready event */
    this.on("dom:ready", (event: DOMReadyEvent) => {
      /* do something with the DOM tree */
      const buttons = event.document.getElementsByTagName("button");

      /* report a new error */
      this.report({
        node: buttons[0],
        message: "Button are not allowed",
      });
    });
  }
}
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

```ts
import { HtmlElement } from "html-validate";

const node: HtmlElement = {} as unknown as HtmlElement;

/* --- */

import { sliceLocation } from "html-validate";

/* recommended: move start location by 5 characters */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const location = sliceLocation(node.location, 5);
```

```ts
import { HtmlElement, Location } from "html-validate";

const node: HtmlElement = {} as unknown as HtmlElement;

/* --- */

/* not recommended: construct location manually */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const location: Location = {
  filename: node.location.filename,
  line: 1,
  column: 2,
  offset: 1,
  size: 5,
};
```

## Error context

Error messages may optionally include additional context.
Most CLI formatters will not include the context but JSON output and when using the API gives access to the contextual data.
This is very useful for IDE support as the short regular message might not always include enough information about why something is not allowed in a particular case.

The most important difference is that the context object is passed to the `documentation` method and can be used to give a better description of the error.

```ts
import { HtmlElement } from "html-validate";

const node: HtmlElement = {} as unknown as HtmlElement;

/* --- */

import { Rule, RuleDocumentation } from "html-validate";

interface RuleContext {
  tagname: string;
  allowed: string[];
}

export class MyRule extends Rule<RuleContext> {
  /* documentation callback now accepts the optional context as first argument */
  public documentation(context?: RuleContext): RuleDocumentation {
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

  public setup(): void {
    /* actual setup code left out for brevity */

    /* create a context object for this error */
    const context: RuleContext = {
      tagname: node.tagName,
      allowed: ["<b>", "<i>", "<u>"],
    };

    /* pass the context when reporting an error */
    this.report({
      node,
      message: "This element cannot be used here",
      context,
    });
  }
}
```

<div class="alert alert-info">
	<i class="fa-solid fa-info-circle" aria-hidden="true"></i>
	<strong>Note</strong>
	<p>Even if your rule reports contextual data the API user might not pass it back to the <code>documentation()</code> call so you must always test if the context object was actually passed or not.</p>
</div>

## Message interpolation

The error message may contain placeholders using `{{ ... }}`.
When a placeholder is found it is replaced with a matching key from the context object.

```ts nocompile
const context = {
  value: "my value",
};
this.report({
  node: element,
  message: 'This element cannot have the value "{{ value }}"',
  context,
});
```

The reported message will be:

> This element cannot have the value "my value"

This can be used as an alternative to using template literals, for instance if the string is reused multiple times.

## Options

If the rule has options create an interface and pass as the second template argument.
Options can either be accessed in the class constructor or on `this.options`.
If any option is required be use to include defaults as the use must not be required to enter any options in their configuration.

```typescript
import { HtmlElement } from "html-validate";

const node: HtmlElement = {} as unknown as HtmlElement;

/* --- */

import { Rule } from "html-validate";

interface RuleOptions {
  text: string;
}

const defaults: RuleOptions = {
  text: "lorem ipsum",
};

export class MyRule extends Rule<void, RuleOptions> {
  public constructor(options: Partial<RuleOptions>) {
    /* assign default values if not provided by user */
    super({ ...defaults, ...options });
  }

  public setup(): void {
    /* actual setup code left out for brevity */

    /* disallow the node from containing the text provided in the option */
    if (node.textContent.includes(this.options.text)) {
      this.report({
        node,
        message: "Contains disallowed text",
      });
    }
  }
}
```

### Options validation

If the optional `schema()` function is implemented is should return [JSON schema](https://json-schema.org/learn/getting-started-step-by-step.html) for the options interface.

<div class="alert alert-info">
	<i class="fa-solid fa-info-circle" aria-hidden="true"></i>
	<strong>Note</strong>
	<p>Note the function must be <code>static</code> as it will be called before the instance is created, i.e. no unvalidated options will ever touch the rule implementation.</p>
</div>

The object is merged into the `properties` object of a boilerplate object schema.

```ts
import { Rule, SchemaObject } from "html-validate";

interface RuleOptions {
  text: string;
}

export class MyRule extends Rule<void, RuleOptions> {
  public static schema(): SchemaObject {
    return {
      text: {
        type: "string",
      },
    };
  }

  public setup(): void {
    /* ... */
  }
}
```

Given the above schema users will receive errors such as following:

```plaintext
A configuration error was found in ".htmlvalidate.json":
  TYPE should be string

    3 |   "elements": ["html5"],
    4 |   "rules": {
  > 5 |     "my-rule": ["error", {"text": 12 }]
      |                                   ^^ 👈🏽  type should be string
    6 |   }
    7 | }
    8 |
```

Schema validation will help both the user and the rule author:

- The user will get a descriptive errors message including details of which configuration file and where the error occured.
- The rule author will not have to worry about the data the `options` parameter, i.e. it can safely be assumed each property has the proper datatypes and other restrictions imposed by the schema.

## Cache

Expensive operations on `DOMNode` can be cached using the {@link dev/cache cache API}.

## API

### `options: RuleOptions`

Object with all the options passed from the configuration.
Options are accessed using `this.options`.

When using typescript: pass the datatype as the second template argument when extending `Rule`.
Default is `void` (i.e. no options)

### `on(event: string, [filter: (event: Event) => boolean], callback: (event: Event) => void): void`

Listen for events. See [events](/dev/events.html) for a full list of available events and data.

If `filter` is passed the callback is only called if the filter function evaluates to true.

### `report({ node: DOMNode, message: string, location?: Location, context?: RuleContext }): void`

Report a new error.

- `node` - The `DOMNode` this error belongs to.
- `message` - Error message
- _`location`_ - If set it is the precise location of the error. (Default: node
  location)
- _`context`_ - If set it will be passed to `documentation()` later to allow
  retrieving contextual documentation.

### `getMetaFor(tagName: string): MetaElement | null`

Get (static) metadata for given tag.

### `getTagsWithProperty(propName: MetaLookupableProperty): string[]`

Find all tags which has enabled given property.

### `getTagsDerivedFrom(tagName: string): string[]`

Find tag matching tagName or inheriting from it.
