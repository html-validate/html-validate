# html-validate changelog

# [1.16.0](https://gitlab.com/html-validate/html-validate/compare/v1.15.0...v1.16.0) (2019-11-09)

### Bug Fixes

- **cli:** fix `--init` not creating configuration unless overwriting ([9098529](https://gitlab.com/html-validate/html-validate/commit/90985293bf941c54055c93b35a6c6f865a2f65e6))
- **config:** use `readFile` to prevent unintended caching ([4864bfa](https://gitlab.com/html-validate/html-validate/commit/4864bfa26edaf77b7bf7b0f551ffe7469a803c42))

### Features

- **shim:** expose version number in shim ([890d122](https://gitlab.com/html-validate/html-validate/commit/890d12269cfbfff7ce6b4e49e1876bb51ca7ccdd))

# [1.15.0](https://gitlab.com/html-validate/html-validate/compare/v1.14.1...v1.15.0) (2019-11-03)

### Bug Fixes

- **cli:** `--help` does not take an argument ([e22293f](https://gitlab.com/html-validate/html-validate/commit/e22293fc3257f6ba9732016d2be44214299e23c2))

### Features

- **cli:** add `--dump-source` to debug transformers ([4d32a0d](https://gitlab.com/html-validate/html-validate/commit/4d32a0d6fc8e3caaa62107affa94fe0fe16aab1f))
- **cli:** add `--init` to create initial configuration ([6852d30](https://gitlab.com/html-validate/html-validate/commit/6852d30dcbccc5ebed3267c6dd181146156646f0))

## [1.14.1](https://gitlab.com/html-validate/html-validate/compare/v1.14.0...v1.14.1) (2019-10-27)

### Bug Fixes

- input hidden should not have label ([66cf13d](https://gitlab.com/html-validate/html-validate/commit/66cf13d489cbb641fabe83121fa0f135440875f8)), closes [#53](https://gitlab.com/html-validate/html-validate/issues/53)

# [1.14.0](https://gitlab.com/html-validate/html-validate/compare/v1.13.0...v1.14.0) (2019-10-20)

### Features

- **shim:** expose more types ([86bb78d](https://gitlab.com/html-validate/html-validate/commit/86bb78d))
- enable typescript strict mode (excect strict null) ([5d2b45e](https://gitlab.com/html-validate/html-validate/commit/5d2b45e))
- **htmlvalidate:** support passing filename to `validateString` ([c2e09a2](https://gitlab.com/html-validate/html-validate/commit/c2e09a2))

# [1.13.0](https://gitlab.com/html-validate/html-validate/compare/v1.12.0...v1.13.0) (2019-10-13)

### Features

- **rules:** support deprecating rules ([de80d96](https://gitlab.com/html-validate/html-validate/commit/de80d96))

# [1.12.0](https://gitlab.com/html-validate/html-validate/compare/v1.11.0...v1.12.0) (2019-10-08)

### Features

- **cli:** new API to get validator instance ([6f4be7d](https://gitlab.com/html-validate/html-validate/commit/6f4be7d))
- **cli:** support passing options to CLI class ([aa544d6](https://gitlab.com/html-validate/html-validate/commit/aa544d6))
- **config:** add `root` property to stop searching file system ([9040ed5](https://gitlab.com/html-validate/html-validate/commit/9040ed5))
- **shim:** expose HtmlElement in shim ([dbb673f](https://gitlab.com/html-validate/html-validate/commit/dbb673f))

# [1.11.0](https://gitlab.com/html-validate/html-validate/compare/v1.10.0...v1.11.0) (2019-09-23)

### Bug Fixes

- **config:** expand `<rootDir>` in elements ([eeddf4c](https://gitlab.com/html-validate/html-validate/commit/eeddf4c))

### Features

- **meta:** new property `scriptSupporting` ([c271a04](https://gitlab.com/html-validate/html-validate/commit/c271a04))

# [1.10.0](https://gitlab.com/html-validate/html-validate/compare/v1.9.1...v1.10.0) (2019-09-19)

### Features

- **api:** better exposure of cli api ([2c16c5b](https://gitlab.com/html-validate/html-validate/commit/2c16c5b))
- **api:** new method `validateMultipleFiles` ([536be69](https://gitlab.com/html-validate/html-validate/commit/536be69))

## [1.9.1](https://gitlab.com/html-validate/html-validate/compare/v1.9.0...v1.9.1) (2019-09-19)

### Bug Fixes

- **rules:** fix handling of invalid void style ([4682d96](https://gitlab.com/html-validate/html-validate/commit/4682d96)), closes [#52](https://gitlab.com/html-validate/html-validate/issues/52)

# [1.9.0](https://gitlab.com/html-validate/html-validate/compare/v1.8.0...v1.9.0) (2019-09-17)

### Features

- **rules:** new rule `svg-focusable` ([c354364](https://gitlab.com/html-validate/html-validate/commit/c354364))

# [1.8.0](https://gitlab.com/html-validate/html-validate/compare/v1.7.1...v1.8.0) (2019-09-16)

### Bug Fixes

- **rules:** fix prefer-button crashing on boolean type attribute ([94ce2a8](https://gitlab.com/html-validate/html-validate/commit/94ce2a8))

### Features

- **cli:** allow specifying extensions ([2bdd75f](https://gitlab.com/html-validate/html-validate/commit/2bdd75f))
- **cli:** cli learned `--version` to print version number ([95c6737](https://gitlab.com/html-validate/html-validate/commit/95c6737))
- **cli:** exit early when encountering unknown cli arguments ([1381c51](https://gitlab.com/html-validate/html-validate/commit/1381c51))
- **cli:** expose expandFiles function ([edab9cf](https://gitlab.com/html-validate/html-validate/commit/edab9cf))
- **cli:** handle passing directories ([f152a12](https://gitlab.com/html-validate/html-validate/commit/f152a12))
- **cli:** support setting cwd when calling expandFiles ([420dc88](https://gitlab.com/html-validate/html-validate/commit/420dc88))
- **event:** new event config:ready ([c2990b5](https://gitlab.com/html-validate/html-validate/commit/c2990b5))

## [1.7.1](https://gitlab.com/html-validate/html-validate/compare/v1.7.0...v1.7.1) (2019-09-15)

### Bug Fixes

- **config:** better error message when transformer fails to load ([c5a4f38](https://gitlab.com/html-validate/html-validate/commit/c5a4f38))

# [1.7.0](https://gitlab.com/html-validate/html-validate/compare/v1.6.0...v1.7.0) (2019-09-11)

### Bug Fixes

- **parser:** fix conditional comments pushing elements into tree ([b26fe80](https://gitlab.com/html-validate/html-validate/commit/b26fe80)), closes [#51](https://gitlab.com/html-validate/html-validate/issues/51)
- **rules:** attr-case no longer reports duplicate errors for dynamic attributes ([c06ae67](https://gitlab.com/html-validate/html-validate/commit/c06ae67)), closes [#48](https://gitlab.com/html-validate/html-validate/issues/48)

### Features

- **location:** allow sliceLocation to wrap line/column ([cbd7796](https://gitlab.com/html-validate/html-validate/commit/cbd7796))
- **rules:** add PascalCase and camelCase styles for `attr-case` ([9e91f81](https://gitlab.com/html-validate/html-validate/commit/9e91f81)), closes [#49](https://gitlab.com/html-validate/html-validate/issues/49)

# [1.6.0](https://gitlab.com/html-validate/html-validate/compare/v1.5.1...v1.6.0) (2019-09-01)

### Bug Fixes

- **matchers:** typo in error message ([daeabba](https://gitlab.com/html-validate/html-validate/commit/daeabba))

### Features

- **matchers:** optionally test context ([44fcf47](https://gitlab.com/html-validate/html-validate/commit/44fcf47))

## [1.5.1](https://gitlab.com/html-validate/html-validate/compare/v1.5.0...v1.5.1) (2019-08-20)

### Bug Fixes

- **elements:** mark contextmenu attribute as deprecated ([db4069f](https://gitlab.com/html-validate/html-validate/commit/db4069f))

### Features

- **rules:** new rule no-unknown-elements ([96f5fcf](https://gitlab.com/html-validate/html-validate/commit/96f5fcf))

## [1.5.0](https://gitlab.com/html-validate/html-validate/compare/v1.4.0...v1.5.0) (2019-08-17)

### Bug Fixes

- **elements:** `<img>` must have non-empty src ([8916e19](https://gitlab.com/html-validate/html-validate/commit/8916e19))
- **rules:** change output format of wcag/h37 and element-required-attributes to match ([26f5074](https://gitlab.com/html-validate/html-validate/commit/26f5074))

### Features

- **cli:** add --config to specify a custom configuration file ([87b565f](https://gitlab.com/html-validate/html-validate/commit/87b565f))
- **elements:** `<fieldset>` requires `<legend>` ([0bce9dd](https://gitlab.com/html-validate/html-validate/commit/0bce9dd))
- **elements:** `<head>` requires `<title>` ([8aaa801](https://gitlab.com/html-validate/html-validate/commit/8aaa801))
- **elements:** src, href, etc attributes cannot be empty ([89c7ac6](https://gitlab.com/html-validate/html-validate/commit/89c7ac6))
- **parser:** include valueLocation in doctype event ([803ddae](https://gitlab.com/html-validate/html-validate/commit/803ddae))
- **rules:** new rule doctype-html ([46061a7](https://gitlab.com/html-validate/html-validate/commit/46061a7))
- **rules:** new rule element-required-content ([664dead](https://gitlab.com/html-validate/html-validate/commit/664dead))
- **rules:** new rule no-style-tag ([a1dff5c](https://gitlab.com/html-validate/html-validate/commit/a1dff5c))

## [1.4.0](https://gitlab.com/html-validate/html-validate/compare/v1.3.0...v1.4.0) (2019-08-15)

### Bug Fixes

- **deps:** update dependency acorn-walk to v7 ([1fe89e0](https://gitlab.com/html-validate/html-validate/commit/1fe89e0))
- **reporter:** fix {error,warning}Count after merging reports ([bc657d0](https://gitlab.com/html-validate/html-validate/commit/bc657d0))
- **reporter:** require {error,warning}Count to be present in Result ([b1306a4](https://gitlab.com/html-validate/html-validate/commit/b1306a4))

### Features

- **cli:** add new --max-warnings flag ([e78a1dc](https://gitlab.com/html-validate/html-validate/commit/e78a1dc))
- **reporter:** add {error,warning}Count summary to Report object ([2bae1d0](https://gitlab.com/html-validate/html-validate/commit/2bae1d0))

# [1.3.0](https://gitlab.com/html-validate/html-validate/compare/v1.2.1...v1.3.0) (2019-08-12)

### Features

- **rules:** new rule no-missing-references ([4653384](https://gitlab.com/html-validate/html-validate/commit/4653384))

## 1.2.1 (2019-07-30)

- fix configuration when using multiple extends.

## 1.2.0 (2019-06-23)

- new rule `prefer-tbody` to validate presence of `<tbody>` in `<table`.
- add `requiredAncestors` metadata and validation to test elements with
  additional requirements for the parent elements, such as `<area>` and
  `<dd>`/`<dt>`.
- add `HtmlElement.closest()` to locate a parent matching the given selector.
- add `HtmlElement.matches()` to test if a selector matches the given element.
- fix so multiple combinators can be used in selectors, e.g. `foo > bar > baz`
  now works as expected.

## 1.1.2 (2019-06-18)

- allow div to group elements under dl (fixes #44).

## 1.1.1 (2019-06-07)

- `Reporter` is now exposed in shim.
- `getFormatter` CLI API now returns output as string instead of writing
  directly to stdout.
- `codeframe` formatter now adds final newline in output.

## 1.1.0 (2019-06-04)

- `input-missing-label` now validates `<textarea>` and `<select>`.
- `querySelector` and friends now handles `[attr="keyword-with-dashes"]` and
  similar constructs.

## 1.0.0 (2019-05-12)

- rule `wcag/h37` now ignores images with `role="presentation` or
  `aria-hidden="true"`.
- allow `crossorigin` attribute to be boolean or `""` (maps to `"anonymous"`).
- add `<picture>` element.
- mark `<style>` as foreign as to not trigger errors inside css content.
- allow whitespace around attribute equals sign, e.g `class = "foo"`.

## 0.25.1 (2019-05-10)

- allow raw ampersands (`&`) in quoted attributes.
- extend set of allowed characters in unquoted attributes in lexer.

## 0.25.0 (2019-04-23)

- new rule `unrecognized-char-ref` for validating character references.
- add support for `auto` style for `attr-quotes` rule.
- new rule `no-raw-characters` to check for presence of unescaped `<`, `>` and
  `&` characters.

## 0.24.2 (2019-03-31)

### Features

- new rule `meta-refresh`.
- new event `element:ready` triggered after an element and its children has been
  fully constructed.
- add plugin callbacks `init()` and `setup()`.
- new rule `require-sri`.
- add `<slot>` element.

## 0.24.1 (2019-03-26)

### Bugfixes

- fix broken edit links in footer.
- fix broken import causing typescript API users getting build errors.

## 0.24.0 (2019-03-26)

### Features

- adding link to edit documentation and view rule source in documentation.
- new rule `wcag/h36`.
- new rule `wcag/h30`.
- new rule `long-title`.
- new rule `empty-title`.
- add `UserError` exception which is to be used for any error which is not
  caused by an internal error, e.g. configuration errors or a plugin. The error
  supresses the notice about internal error which should be reported as a bug.
- reworked and extendable validation of elements metadata. Plugins may now add
  support for custom metadata.

### Bugfixes

- fix handling of plugins with no rules.

## 0.23.0 (2019-03-20)

### Features

- new rule `empty-heading` validating headers have textual content.
- let plugins add configuration presets.
- add `processElement` hook on `Source`.
- add `textContent` property on `DOMNode` to get text (recursive) from child
  nodes. A new node type `TextNode` is added.
- add `firstChild` and `lastChild` to `DOMNode`.
- docs: precompile syntax highlighting for smoother page loads.
- expose `Config`, `ConfigData` and `ConfigLoader` in shim.

## 0.22.1 (2019-02-25)

### Breaking change

- `.children` has been split and moved from `HtmlElement` to
  `DOMNode`. `.childNodes` replaces the original `.children` but is now typed
  `DOMNode[]` (and in a future release may contain other node types). A getter
  `.nodeElements` can be used to access only `HtmlElement` from `.childNodes`
  and is typed `HtmlElement[]`. If your rules use `.children` the

### Bugfixes

- `<rootDir>` is now respected when configuring plugins.
- fix cosmetic case of `wcag/h37` rule.

## 0.22.0 (2019-02-24)

### Breaking changes

- `HtmlElement` direct access to `attr` is replaced with `attributes`. The
  former was an key-value object and the latter is a flattened array of
  `Attribute`.

### Features

- exposes `Source` and `AttributeData` in shim.
- `HtmlElement` will now store duplicated (or aliased) attributes. The biggest
  change this introduces is that `classList` will now contain a merged list of
  all classes. This is needed when combining a static `class` attribute with a
  dynamic one.
- DOM `Attribute` got two flags `isStatic` and `isDynamic` to easily tell if the
  value is static or dynamic.
- more verbose exception when a transformer fails. (fixes #37)
- allow `processAttribute` hook to yield multiple attributes, typically used
  when adding aliased attributes such as `:class`. By adding both the alias and
  the original the latter can be validated as well (e.g. `no-dup-attr` can
  trigger for multiple uses of `:class`). (fixes #36)
- allow setting hooks when using `HtmlValidate.validateString`, makes it easier
  to write tests which requires hooks, e.g. processing attributes.

### Bugfixes

- `[attr]` selector now matches boolean attributes.
- `attribute-boolean-style` and `no-dup-attr` now handles when dynamic
  attributes is used to alias other attributes, e.g `:required="foo"` no longer
  triggers an boolean style and `class=".."` combined with `:class=".."` no
  longer triggers duplicate attributes. (fixes #35)
- `attribute-allowed-values` now ignores boolean attributes with dynamic
  values. (partially fixes #35)

## 0.21.0 (2019-02-17)

### Breaking changes

- `button-type` is replaced with `element-required-attributes`.

### Features

- new rule `element-required-attributes` replaces `button-type` and allows any
  element to contain `requiredAttributes` metadata.
- support foreign elements. The body of the foreign element will be discarded
  from the DOM tree and not trigger any rules.
- CLI write a more verbose message when unhandled exceptions are raised.
- `--dump-events` output reduced by hiding element metadata and compacting
  location data.
- use jest snapshots to test element metadata as it is more maintainable.

### Bugfixes

- allow `<area shape="default">` (fixes #31)

## 0.20.1 (2019-02-06)

### Bugfixes

- fix #33: ensure `wcag/h37` and `wcag/h67` checks if node exists before testing
  tagname.
- handle boolean attributes in `attribute-allowed-values`.

## 0.20.0 (2019-01-29)

### Features

- update `codeframe` formatter to show not just start location but also end.

### Bugfixes

- Fixes html-validate-angular#1 by handling both regular and arrow functions.

## 0.19.0 (2019-01-27)

### Breaking changes

- `img-req-alt` has been renamed `wcag/h37`.

### Features

- new rule `prefer-button`.
- `Attribute` now stores location of value.
- new rules `wcag/h32` and `wcag/h67`.
- move `location` and `isRootElement` to `DOMNode` and add new `nodeType`
  property.
- add `Attribute.valueMatches` to test attribute value. Handles `DynamicValue`.
- `querySelector` now handles selector lists (comma-separated selectors)

## 0.18.2 (2019-01-14)

### Bugfixes

- fix issue when calling `getAttributeValue` on a boolean attribute.
- handle `DynamicValue` in `DOMTokenList` and `id-pattern`.

## 0.18.1 (2019-01-12)

### Features

- CLI learned `--print-config` to output configuration for a given file.

## 0.18.0 (2019-01-10)

### Features

- add support for dynamic attribute values, that is the value is marked as being
  set but has no known value. Rules are expected to assume the value exists and
  is valid. The primary usage for this is in combination with the
  `parseAttribute` hook, e.g `:id="..."` can yield attribute `id` with a dynamic
  value.
- add support for transformer hooks, currently the only hook is `parseAttribute`
  allowing the transformer to alter the attribute before any events are emitted,
  e.g. it can pick up the vuejs `:id` attribute and pass it as `id` to allow
  other rules to continue just as if `id` was typed.

### Bugfixes

- fix `ConfigLoader` tests when running on windows.

## 0.17.0 (2019-01-09)

### Breaking changes

- `DOMNode` has been renamed `HtmlElement` and there is instead a new base class
  `DOMnode` which `HtmlElement` extends from. Rules using `DOMNode` need to be
  changed to use `HtmlElement`.

### Features

- use [Prettier](https://prettier.io/) for formatting sources.
- add `HtmlValidate.getRuleDocumentation()` API for IDEs to fetch contextual
  rule documentation.
- add `codeframe` formatter (from eslint).
- add `HtmlValidate.flushConfigCache` to allow flushing the config loader cache.
- add `TemplateExtractor.createSource` as a quick way to create a source from
  filename.
- add typescript definition for `shim.js`
- add `validateSource` to `HtmlValidate` allowing to manually passing a source.
- `HtmlValidate.getConfigFor` is now part of public API.

### Bugfixes

- Directives can now enable/disable rules working with `dom:ready` event.
- `HtmlElement` location is now shifted by 1.

## 0.16.1 (2018-12-16)

### Bugfixes

- `Message` now passes `size` property from `Location`

## 0.16.0 (2018-12-15)

### Features

- `Location` has a new property `size` holding the number of characters the
  location refers to.
- `HtmlValidate` class now loads same default config as CLI if no configuration
  is passed explicitly.
- `Location` has a new property `offset` holding the offset into the source
  data (starting at zero).
- CLI learned `--stdin` and `--stdin-filename` for passing markup on standard
  input and explicitly naming it. Useful for external tools and IDEs which wants
  to pass the markup in stdin instead of a temporary file.

## 0.15.3 (2018-12-05)

### Features

- expose `querySelector` and `querySelectorAll` on `DOMNode`, not just
  `DOMTree`.

## 0.15.2 (2018-12-01)

### Features

- move repository to https://gitlab.com/html-validate/html-validate
- move homepage to https://html-validate.org
- more element attributes added.

## 0.15.1 (2018-11-26)

### Features

- new properties `previousSibling` and `nextSibling` on `DOMNode`.

## 0.15.0 (2018-11-21)

### Features

- new rule `attribute-boolean-style` to validate style of boolean attributes.
- new property `nodeName` on `DOMNode`.

### Bugfixes

- `attribute-allowed-values` now normalizes boolean attributes before
  validating, i.e. it will accept `disabled`, `disabled=""` or
  `disabled="disabled"`. Fixes #13.
- `input` learned `required` attribute.
- `querySelector` properly handles attribute selectors with dashes and
  digits. Fixes #15.

## 0.14.2 (2018-11-06)

### Features

- bump dependencies.
- use `acorn-walk` instead of `acorn@5`.

## 0.14.1 (2018-11-04)

### Bugfixes

- fix dependency on `acorn`, the package now properly resolves acorn 5 when
  dependant pulls acorn 6.

## 0.14.0 (2018-11-03)

- support global metadata.
- new rule `attribute-allowed-values` validates allowed values for attributes,
  such as `type` for `<input>`.

## 0.13.0 (2018-10-21)

### Features

- `deprecated` supports adding a message for custom elements.
- Rule constructors can now throw exceptions. Previously the exceptions would be
  silently swallowed and the rule would trigger the missing rule logic.
- Support writing element metadata inline in configuration file.

### Bugfixes

- `element-permitted-order` now reports the error where the malplaced element is
  instead of the parent element (which holds the restriction). Fixes #10.

## 0.12.0 (2018-10-17)

### Features

- Support writing plugins with custom rules.
- Bump dependencies, including typescript 3.0 to 3.1

## 0.11.1 (2018-10-07)

### Features

- Rule documentation examples are now validated automatically with htmlvalidate
  to provide direct feedback of how a rule will react on the given markup.

### Bugfixes

- `no-implicit-close` now provides more context when closed by a sibling.
- `close-order` no longer reports error for implicitly closed elements.

## 0.11.0 (2018-09-23)

### Breaking changes

- For compatibility with other tools the severity `disable` has been renamed to
  `off`. The old name will continue to work but will be removed in the future.

### Features

- support directives to enable/disable rules inside files, e.g. to ignore a
  single error.
- rules are now using dynamic severity which can change at runtime.
- new class `Attribute` used by `DOMNode`. Attributes now holds the location
  they are created from making DOM attribute rules more precise.
- new rule `heading-level` for validating sequential heading levels.

### Bugfixes

- `element-permitted-occurrences` no longer triggers for the first occurrence,
  only subsequent usages.
- `Table.getMetaFor(..)` is not case-insensitive.

## 0.10.0 (2018-08-11)

### Breaking changes

- rule api overhaul, all rules are now classes.

### Features

- support multiple events for single listener and listener deregistration.
- new `Engine` class for easier programmatical usage.
- stricter types related to events
- bump dependencies.

### Bugfixes

- add espree dependency

## 0.9.2 (2018-07-12)

### Features

- add `no-inline-style` to `htmlvalidate:recommended`.
- add `htmlvalidate:document` for predefined set of document-related rules,
  e.g. recommended for documents but not component templates.
- add `missing-doctype` rule to require doctype.
- add source location to root DOMNode containing the first line and column in
  the source file.
- add `doctype` property to `DOMTree`.
- add `doctype` event, emitted when a doctype is encountered.
- add `element-case` rule for validating case of element names.
- add `attr-case` rule for validating case of attributes.

## 0.9.1 (2018-07-01)

### Features

- add `protractor-html-validate` to docs.

## 0.9.0 (2018-06-17)

### Breaking changes

- semantics for `require` changed from `require('html-validate')` to
  `require('html-validate').HtmlValidate` to support exposing other classes.

### Features

- new `TemplateExtractor` helper class for extracting templates from javascript
  sources.
- trigger downstream projects on release

### Bugfixes

- Report `valid` now only checks for errors, the result will still be valid if
  only warnings are present.

## 0.8.3 (2018-06-12)

- run tests against multiple node versions (8.x, 9.x and 10.x) to ensure
  compatibility.
- exposed `getFormatter` as a reusable function to load formatters from string
  (like CLI tool): `name[=DST][,name=DST...]`

## 0.8.2 (2018-05-28)

### Bugfixes

- lexer better handling of newlines, especially CRLF `\r\n`.

## 0.8.1 (2018-05-27)

### Misc

- update `package.json`

## 0.8.0 (2018-05-27)

### Features

- easier API usage: `require('html-validate')` now returns class without using
  `require(html-validate/build/htmlvalidate').default`.
- support `transform` in configuration to extract source html from other files.
- attach `depth` and `unique` readonly properties to `DOMNode` corresponding to
  the nodes depth in the DOM tree and a sequential id (unique for the session).
- new rule `no-conditional-comments` to disallow usage of conditional comments.
- handle conditional comments.

### Bugfixes

- handle whitespace before doctype
- DOMTokenlist now handles multiple spaces as delimiter and strip
  leading/trailing whitespace.

## 0.7.0 (2017-11-04)

### Features

- new rule `no-implicit-close` to disallow usage of optional end tags.
- handle optional end tags.
- better result sorting, error messages are now sorted by line and column, the
  stage which triggered the error doesn't matter any longer.
- better result merging, files will no longer be duplicated.
- element metadata can no be sourced from multiple sources and be configured
  using the `elements` configuration property.

### Improvements

- better configuration merging

### Bugfixes

- fixed script tag incorrectly consuming markup due to greedy matching.

## 0.6.0 (2017-10-29)

### Features

- new rule `no-deprecated-attr` for testing if any deprecated attributes is
  used.
- CLI supports globbing (as fallback if shell doesn't expand the glob already)

### Bugfixes

- fix lowercase `<!doctype html>` crashing the lexer.
- fix node binary name in shebang
- fix directory traversal on windows

## 0.5.0 (2017-10-17)

### Features

- Rule `element-name` learned `whitelist` and `blacklist` options.
- Support outputting to multiple formatters and capturing output to file.
- checkstyle formatter. Use `-f checkstyle`.

## 0.4.0 (2017-10-17)

### Features

- new rule `no-inline-style` disallowing inline `style` attribute.
- new rule `img-req-alt` validating that images have alternative text.
- new rule `element-permitted-order` validating the required order of elements
  with restrictions.
- new rule `element-permitted-occurrences` validating elements with content
  models limiting the number of times child elements can be used.

### Bugfixes

- the parser now resets the DOM tree before starting, fixes issue when running
  the same parser instance on multiple sources.

## 0.3.0 (2017-10-12)

### Features

- new rules `id-pattern` and `class-pattern` for requiring a specific formats.
- new rule `no-dup-class` preventing duplicate classes names on the same
  element.

### Bugfixes

- lexer now chokes on `<ANY\n<ANY></ANY></ANY>` (first tag missing `>`) instead
  of handling the inner `<ANY>` as an attribute.
- `element-permitted-content` fixed issue where descending with missing metadata
  would report as disallowed content.

## 0.2.0 (2017-10-11)

### Features

- Support putting configuration in `.htmlvalidate.json` file.
- `void` rule rewritten to better handle both tag omission and self-closing. It
  learned a new option `style` to allow a single style.
- new rule `element-permitted-content` verifies that only allowed content is
  used.
- new rule `element-name` to validate custom element names.

## 0.1.3 (2017-10-08)

### Features

- Rule documentation

### Bugfixes

- `no-dup-attr` now handles attribute names with different case.
