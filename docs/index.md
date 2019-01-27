@ngdoc frontpage
@module frontpage
@name
@description

@block Features

### Fragments and components

In addition to validating plain `.html` files HTML-validate can also validate
sources inside `.js` components (or any other source) by extracting html
fragments (transforming).

Neither `.html` files or component fragments need to be a complete document
(e.g. doctype is not required).

**Learn more about [transforming sources](usage/transformers.html).**

### Offline

Many validators will behind the scene upload the markup to online services such
as W3C. HTML-validate performs all validation locally, no markup leaves your
machine, providing a faster and more secure response which can easily be
integrated with tools and IDEs.

**This means your source code is safe and is never leaked outside of your
organization.**

### Strict parsing

When rendering a document it is useful to try to correct malformed markup but a
validator should be strict. No corrections, assumptions or guessing is done. If
the markup is invalid the parser will tell you so.

By ensuring the markup is strictly valid it reduces the amount of bugs where
different browsers autocorrected the markup different.

### HTML5 content model

Each element is matched against metadata for deeper logic and analyzation such
as whenever an element is allowed in the current context or if a required
element is missing.

- permitted ancestors and descendants
- permitted order ond occurrences
- deprecated elements and attributes
- flow ("block"), phrasing ("inline") etc

**Learn more about [writing element metadata](usage/elements.html) for custom
components.**

### Extendable

Write your own element metadata, rules and/or business logic.

Write your own sharable configurations or plugins.

**Learn more about [writing rules](dev/writing-rules.html) and [writing
plugins](dev/writing-plugins.html).**

### Frameworks

First-class support for:

- [angular](https://www.npmjs.com/package/html-validate-angular)
- [vue](https://www.npmjs.com/package/html-validate-vue)
- [protractor](https://www.npmjs.com/package/protractor-html-validate)

@block Examples

### Content model

<validate name="frontpage-contentmodel">
  <footer>
    <fieldset>
      <p>Lorem ipsum dolor sit amet</p>
      <legend>Consectetur adipiscing elit</legend>
    </fieldset>

    <main>
      <blink>(c) 2018 Initech</blink>
    </main>

  </footer>
</validate>

### Accessibility

<validate name="frontpage-a17y" rules="wcag/h37 button-type input-missing-label">
  <img src="logo.png">
  <button onclick="myFunction();">Click me!</button>

  <div class="field-wrapper">
    <strong>Name: </strong>
    <input name="name">
  </div>
</validate>

### Custom components

<validate name="frontpage-components" elements="frontpage.json">
  <my-inline>
    <my-block></my-block>
    <my-deprecated></my-deprecated>
  </my-inline>
</validate>
