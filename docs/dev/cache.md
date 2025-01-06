---
docType: content
title: DOM cache API
nav: devguide
---

# DOM cache API

The DOM cache API can be used to save computations on DOM nodes (e.g. elements).
Values are cached per node.

For example, testing if an element is part of the accessibility tree includes multiples tests not only on the node itself but also all of the ancestors, for instance:

- Does the element or one of its ancestors have the `hidden` attribute?
- Does the element or one of its ancestors have the `inert` attribute?
- Does the element or one of its ancestors have `aria-hidden="true"`?
- etc

Testing if an element is part of the accessibility tree is a frequent test required by most of the a11y related tests and thus gains by caching the result.

::: warning

The cache API is only available after the DOM is fully constructed, i.e. after the `dom:ready` event has fired.

:::

## When to use

There is no definitive answer as it is always a tradeof between memory and performance but as a rule of thumb you should use the cache API if the computation result:

- Is reused in multiple rules.
- Is reused multiple times within the same rule.
- Involves ancestors or descendants (cache the intermediate result on each node as you go)

## Cache key

Each cache must use a unique key.
The cache is stored per `DOMNode` so the key must only be unique per type of computation not per instance.

The cache key is typically `Symbol` named after the function performing the calculation but any unique string can be used.

```ts
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const CACHE_KEY = Symbol(myFunction.name);

function myFunction(): void {
  /* ... */
}
```

## Type safety (typescript)

Type safety can be archived by augmenting the `DOMNodeCache` interface:

```ts
const CACHE_KEY = Symbol();

/* --- */

declare module "html-validate" {
  export interface DOMNodeCache {
    [CACHE_KEY]?: number;
  }
}
```

This ensures the typescript type system will correctly infer the proper datatypes when storing and fetching values.

Type declaration is optional but strongly recommended.
Without type declaration the value is implied to be `any` and the user must manually ensure it is of the correct type.

## Example

```ts
import { HtmlElement } from "html-validate";

function expensiveComputation(_node: HtmlElement): number {
  return 0;
}

/* --- */

const CACHE_KEY = Symbol(myFunction.name);

declare module "html-validate" {
  export interface DOMNodeCache {
    [CACHE_KEY]: number;
  }
}

export function myFunction(node: HtmlElement): number {
  const cached = node.cacheGet(CACHE_KEY);
  if (typeof cached !== "undefined") {
    return cached;
  }
  const value = expensiveComputation(node);
  return node.cacheSet(CACHE_KEY, value);
}
```

## API

### `DOMNode.cacheGet<K>(key: K): DOMNodeCache[K] | undefined`

Fetch cached value from a `DOMNode`.
Returns `undefined` if no cached value is present.

### `DOMNode.cacheSet<K>(key: K, value: DOMNodeCache[K]): DOMNodeCache[K]`

Store value on `DOMNode`.

### `DOMNode.cacheRemove<K>(key: K): boolean`

Remove value from `DOMNode`.
Returns `true` if a value was present and `false` if there was none.

### `DOMNode.cacheExists<K>(key: K): boolean`

Check if a value is cached in `DOMNode`.
