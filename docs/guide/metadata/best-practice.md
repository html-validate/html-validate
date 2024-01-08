---
docType: content
title: Writing custom element metadata - Best practice
nav: metadata
---

# Best practice

## For applications

### A1. Always include element metadata from libraries if present

Why: when using IDE plugins you get help using the library right in the editor.

Why: easier upgrade paths when the validation will help find bugs and deprecations.

Why: the library may include custom rules to prevent invalid usage.

### A2. Write element metadata for all custom components

Why: To get full benefits of the validator all custom elements must include metadata.

## For libraries

### L1. Bundle element metadata in the same package

Always bundle the element metadata in the same package as your library.

Why: this way the metadata is always in sync with the actual components and the end-user does not have to install a separate package.

How: include all element metadata in the same repository as your library and make sure the files are included when publishing package (e.g. ensure they are present in `package.json` `files` property)

### L2. Wrap in plugin with configuration preset

Always wrap the metadata in a plugin exposing a `recommended` configuration.

The end-user would then use the library with something similar to this without knowing much about where your files lives:

```json
{
  "plugins": ["my-library/htmlvalidate"],
  "extends": ["html-validate:recommended", "my-library:recommended"]
}
```

Why: it is easier for the end-user to use it as they don't need to keep track of how it is supposed to be used.

Why: files can be moved around easier as long as the plugin is intact.

Why: seamless for end-users if you later decide to add custom rules, recommended rules, etc.

How: create a plugin folder (preferably named `htmlvalidate`) in your repository with an `index.js` file implementing the `Plugin` API.
See documentation for {@link dev/writing-plugins writing plugins}.

### L3. Include metadata for all elements

No matter how insignificant always include element metadata for all components.

Why: without any metadata the element is silently ignored and can cause similar unnoticed errors for other elements.
Consider if A > B is disallowed but with an unknown C between A > C > B no errors will be yielded as it is not known if C can be content of A or if it can be the parent of B.

Why: it makes you think about intended semantics of your components.

Why: makes deprecations easier.

How: Use {@link rules/no-unknown-elements no-unknown-elements} rule to find elements you have not yet provided metadata for.

### L4. Use deprecations

If you ever find yourself removing an element or attribute mark it as deprecated.

Why: end-users get errors about using deprecated elements and attributes making it easier to migrate.

Why: a properly configured CI pipeline would fail the build.

How: deprecate elements using the `deprecated` property.

How: deprecate attributes using the `deprecatedAttributes` property.

### L5. Write unit-tests

Consider the metadata as part of your deliverable and thus you should write tests to ensure it always works as expected.

How: See {@link guide/metadata/writing-tests writing tests} for details how to write unit tests.
