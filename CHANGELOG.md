# html-validate changelog

## [2.23.1](https://gitlab.com/html-validate/html-validate/compare/v2.23.0...v2.23.1) (2020-06-21)

### Bug Fixes

- **rules:** `no-trailing-whitespace` handles CRLF (windows) newlines ([2aaddc2](https://gitlab.com/html-validate/html-validate/commit/2aaddc2daaa219f16031cc105e0d396387eac07c)), closes [#93](https://gitlab.com/html-validate/html-validate/issues/93)

# [2.23.0](https://gitlab.com/html-validate/html-validate/compare/v2.22.0...v2.23.0) (2020-05-18)

### Bug Fixes

- **cli:** `expandFiles` path normalization for windows ([b902853](https://gitlab.com/html-validate/html-validate/commit/b902853e696a04202959ae6c4cf086bd48911e4d))

### Features

- **config:** add two new config presets `html-validate:standard` and `html-validate:a17y` ([36bf9ec](https://gitlab.com/html-validate/html-validate/commit/36bf9ec3be7356d534d352d00610d8253885de22)), closes [#90](https://gitlab.com/html-validate/html-validate/issues/90)
- **rules:** add `include` and `exclude` options to `prefer-button` ([b046dc5](https://gitlab.com/html-validate/html-validate/commit/b046dc5943a4bd05dff9766ea6b9c9f522c09d1a)), closes [#90](https://gitlab.com/html-validate/html-validate/issues/90)
- **rules:** add `isKeywordExtended` method for rule authors ([ca7e835](https://gitlab.com/html-validate/html-validate/commit/ca7e835d384c7ed43967bec14f56836353a0b1f6))

# [2.22.0](https://gitlab.com/html-validate/html-validate/compare/v2.21.0...v2.22.0) (2020-05-15)

### Bug Fixes

- **elements:** add `<details>` and `<summary>` elements ([47ba673](https://gitlab.com/html-validate/html-validate/commit/47ba6739951a37bdb285400d392ff27ec57ff89e)), closes [#89](https://gitlab.com/html-validate/html-validate/issues/89)
- `<legend>` should allow heading elements ([73e150f](https://gitlab.com/html-validate/html-validate/commit/73e150f13a8b797458dac4fcbe3a22997422f4d9))
- **deps:** update dependency json-merge-patch to v1 ([e9f83d2](https://gitlab.com/html-validate/html-validate/commit/e9f83d2047aed16e81fe006795c9b30111478534))

### Features

- **rules:** new rule `no-autoplay` ([9ed5474](https://gitlab.com/html-validate/html-validate/commit/9ed5474493eedebd2db5c673060538d244b69f63)), closes [#84](https://gitlab.com/html-validate/html-validate/issues/84)

# [2.21.0](https://gitlab.com/html-validate/html-validate/compare/v2.20.1...v2.21.0) (2020-04-26)

### Bug Fixes

- **meta:** throw schema validation error when element metadata does not validate ([6ecf050](https://gitlab.com/html-validate/html-validate/commit/6ecf0501f3f8284c9248ac5fd0643d1c32049333)), closes [#81](https://gitlab.com/html-validate/html-validate/issues/81)
- **schema:** allow `permittedContent` and `permittedDescendants` to use AND-syntax ([2fa742c](https://gitlab.com/html-validate/html-validate/commit/2fa742c03b84145d0fa334809ff1f98f80cfc263)), closes [#82](https://gitlab.com/html-validate/html-validate/issues/82)
- **transform:** expose `computeOffset` ([d033538](https://gitlab.com/html-validate/html-validate/commit/d033538c58ff921026fc3a025e679c8b8f2e144e))

### Features

- **dom:** `DOMTokenList` can extract location data for each token ([4f4dfe0](https://gitlab.com/html-validate/html-validate/commit/4f4dfe05ccdb93c8ba27754e8ae9785fc91508eb)), closes [#74](https://gitlab.com/html-validate/html-validate/issues/74)
- **rules:** add `include` and `exclude` options to `no-inline-style` ([6604e88](https://gitlab.com/html-validate/html-validate/commit/6604e88e96d59c67d596b92be760b1ba5a971589)), closes [html-validate/html-validate-angular#3](https://gitlab.com/html-validate/html-validate-angular/issues/3)
- **rules:** use more precise location from `DOMTokenList` ([e874784](https://gitlab.com/html-validate/html-validate/commit/e874784858badb3a448cc739189cdac5ef577efe))

## [2.20.1](https://gitlab.com/html-validate/html-validate/compare/v2.20.0...v2.20.1) (2020-04-19)

### Bug Fixes

- handle loading js-files via `extends` again ([e29987f](https://gitlab.com/html-validate/html-validate/commit/e29987f213a1f295751c285c582209047c68bc2b))

# [2.20.0](https://gitlab.com/html-validate/html-validate/compare/v2.19.0...v2.20.0) (2020-04-05)

### Bug Fixes

- **meta:** add missing null return type to MetaTable.getMetaFor ([44eac5b](https://gitlab.com/html-validate/html-validate/commit/44eac5b4efffdd0bcf6973364b595501eabe9b25))
- allow loading elements from js-file again ([5569a94](https://gitlab.com/html-validate/html-validate/commit/5569a9428cef8ca168d79a2e75be851e141838e8))
- make `ast` property private ([cb1a2c8](https://gitlab.com/html-validate/html-validate/commit/cb1a2c867583616819488102a3a46431821615a6))

### Features

- support loading custom formatters ([0b02a31](https://gitlab.com/html-validate/html-validate/commit/0b02a31c4f34cca840c9ada60e76634976461f38))
- **formatters:** use factory to load formatters to make it more webpack-friendly ([81bef6e](https://gitlab.com/html-validate/html-validate/commit/81bef6e79287884ee2a6c804cefe136e222c1b78))

# [2.19.0](https://gitlab.com/html-validate/html-validate/compare/v2.18.1...v2.19.0) (2020-03-24)

### Bug Fixes

- **meta:** deep merge during inheritance ([85c377d](https://gitlab.com/html-validate/html-validate/commit/85c377d185492407d72fde39bd14d6a80935a56a)), closes [#72](https://gitlab.com/html-validate/html-validate/issues/72)

### Features

- **meta:** implicit inheritance when overriding existing element ([8833a0f](https://gitlab.com/html-validate/html-validate/commit/8833a0fcc9873eee4938619cdae78afa45e48ce5))

## [2.18.1](https://gitlab.com/html-validate/html-validate/compare/v2.18.0...v2.18.1) (2020-03-22)

### Bug Fixes

- **meta:** allow regexp literal in element schema ([444a472](https://gitlab.com/html-validate/html-validate/commit/444a4726f7b8693188ad80c725f57f0e33844ca7)), closes [#70](https://gitlab.com/html-validate/html-validate/issues/70)
- **meta:** make all meta properties optional in type declaration ([eac5052](https://gitlab.com/html-validate/html-validate/commit/eac505234e2bdac2fb6d19ba8ef81bd947a7bba9))
- **meta:** support case-insensitive regexp flag ([96e7343](https://gitlab.com/html-validate/html-validate/commit/96e734396f9ee90358a4b74e091f14387eda9c99)), closes [#69](https://gitlab.com/html-validate/html-validate/issues/69)
- **rules:** use original wcag rule names ([1d5aa3c](https://gitlab.com/html-validate/html-validate/commit/1d5aa3c83add6b51bf062508cbaf9a868572446f))

### Reverts

- Revert "ci: temporary add debug to troubleshoot @semantic-release/gitlab" ([b4d016b](https://gitlab.com/html-validate/html-validate/commit/b4d016b442e618b38b5140de17d59b6393956ded))

# [2.18.0](https://gitlab.com/html-validate/html-validate/compare/v2.17.1...v2.18.0) (2020-03-11)

### Bug Fixes

- validate `input[list]` ([9c70db2](https://gitlab.com/html-validate/html-validate/commit/9c70db243aa3fa0c9243bc6fd6a206bac28a5873))
- **rules:** `no-dup-id` handles when id is set but omitted value ([5f678a5](https://gitlab.com/html-validate/html-validate/commit/5f678a566c006d50b90fee23d140b5f49784b0e0))
- **rules:** `no-missing-references` ignores omitted references ([b8863cd](https://gitlab.com/html-validate/html-validate/commit/b8863cd8ebd8c5c05e97ef9e5e662f406aa1cb92))
- **rules:** add contextual documentation for `deprecated` ([7fbf433](https://gitlab.com/html-validate/html-validate/commit/7fbf433f9ce70ce34759448936d40c7dd96f55ae))
- **rules:** add contextual documentation for `element-name` ([2a98bad](https://gitlab.com/html-validate/html-validate/commit/2a98bada16a15c802a3e050e9274153237e916fd))
- **rules:** better and more contextual messages for `deprecated` ([3602be7](https://gitlab.com/html-validate/html-validate/commit/3602be730dd2ec54e1de702171ce606e4043c02a))
- **rules:** contextual documentation for `deprecated-rule` ([8b10601](https://gitlab.com/html-validate/html-validate/commit/8b10601405f74ddbe62a6d666153dece1b3ad9a4))
- **rules:** improve documentation for `doctype-html` ([1a896a8](https://gitlab.com/html-validate/html-validate/commit/1a896a87f8e7c253e4d21faf01aae6f52df754f8))
- **shim:** expose `ConfigError` and `UserError` ([2d002c7](https://gitlab.com/html-validate/html-validate/commit/2d002c79f1f6f088c1792de768ba80777629b739))
- **transform:** ignore non-string values in `TemplateExtractor` ([7f27c8b](https://gitlab.com/html-validate/html-validate/commit/7f27c8b6b0ff4f4afd85501b0b554886742b5c6f))
- allow both null and empty string when attribute allows empty values ([5b6991b](https://gitlab.com/html-validate/html-validate/commit/5b6991b6ea7d8b4418168b1f9d0f8bef7cac935e))

### Features

- `attribute-allowed-values` handle omitted values ([962d079](https://gitlab.com/html-validate/html-validate/commit/962d0791dae6ad4fed663909556c480f5789cd81))
- new rule `attribute-empty-style` ([a328b55](https://gitlab.com/html-validate/html-validate/commit/a328b558adced37c05b76dddd6cf6f83d36fe72d))

## [2.17.1](https://gitlab.com/html-validate/html-validate/compare/v2.17.0...v2.17.1) (2020-03-02)

### Bug Fixes

- disable `void-style` when using `toHTMLValidate` matcher ([4d6bb3d](https://gitlab.com/html-validate/html-validate/commit/4d6bb3d7fe8f0e174082eb3c39d7f6dcd9109f56))

# [2.17.0](https://gitlab.com/html-validate/html-validate/compare/v2.16.0...v2.17.0) (2020-02-17)

### Bug Fixes

- **elements:** `<img>` `srcset` attribute cannot be empty ([27699ad](https://gitlab.com/html-validate/html-validate/commit/27699ad08d4f9363b275449df3110f36f1b0ee9d))
- **jest:** typescript compatibility with jest@23 ([4efae54](https://gitlab.com/html-validate/html-validate/commit/4efae544dbe9cd499e352776edbde1ea03d83706))
- **rules:** add `aria-label` helper ([6d5d963](https://gitlab.com/html-validate/html-validate/commit/6d5d9630666bec57e70ea3ce563cbef558e2ab3b))
- **rules:** fix `deprecated-rule` missing location ([1156c1e](https://gitlab.com/html-validate/html-validate/commit/1156c1e8b6153ee8ac5691df8f3fdeddfb896255))
- change config merge order in `toHTMLValidate` ([204a8fa](https://gitlab.com/html-validate/html-validate/commit/204a8faac7cfe34b8e0fe2b834124b2b9502e231))
- **rules:** handle `aria-label` on links for WCAG H30 ([eb01542](https://gitlab.com/html-validate/html-validate/commit/eb01542abb0fbf4104672794e621b6bf5564903c)), closes [#67](https://gitlab.com/html-validate/html-validate/issues/67)

### Features

- **rules:** mark `void` as deprecated ([f6afc0f](https://gitlab.com/html-validate/html-validate/commit/f6afc0fd15877695b735754d0eca6dc013252abc)), closes [#58](https://gitlab.com/html-validate/html-validate/issues/58)
- **rules:** new rule `no-self-closing` ([d9c869b](https://gitlab.com/html-validate/html-validate/commit/d9c869b36e3c5c9c4027809417b535bcd565c5cc)), closes [#58](https://gitlab.com/html-validate/html-validate/issues/58)
- **rules:** new rule `script-element` ([48ad6da](https://gitlab.com/html-validate/html-validate/commit/48ad6da1b965d0299d022dbc27c25ebc0ed3ffc8))
- **rules:** new rule `script-type` ([a680f1d](https://gitlab.com/html-validate/html-validate/commit/a680f1d297100c92f08f5d5de2ac39ee27915c15))
- **rules:** new rule `void-content` ([c93c63b](https://gitlab.com/html-validate/html-validate/commit/c93c63b1a3609d90cc493a6cb448b071905926f0)), closes [#58](https://gitlab.com/html-validate/html-validate/issues/58)
- **rules:** new rule `void-style` ([f30de03](https://gitlab.com/html-validate/html-validate/commit/f30de03ea4f8caaf065047d5e3bd44417d0202ad)), closes [#58](https://gitlab.com/html-validate/html-validate/issues/58)
- allow configuration override when using `validate{String,Source}` ([6e62852](https://gitlab.com/html-validate/html-validate/commit/6e62852c88182defbe9b465ab5652f456310d07e))

# [2.16.0](https://gitlab.com/html-validate/html-validate/compare/v2.15.0...v2.16.0) (2020-02-12)

### Bug Fixes

- **cli:** fix typo when using `--init` with vuejs ([6eee478](https://gitlab.com/html-validate/html-validate/commit/6eee47872e164b16e4152f309ab5971019222ff9))
- **dom:** `querySelector` and friends return empty when selector is empty ([6a871de](https://gitlab.com/html-validate/html-validate/commit/6a871de7bb240507693d266b37c6e4f9228b7e5e))
- **schema:** add title and description to most properties ([a7cea78](https://gitlab.com/html-validate/html-validate/commit/a7cea78ed39643e5808cfd08243f492a235200e7))
- **schema:** handle `$schema` in config and elements ([a4f9054](https://gitlab.com/html-validate/html-validate/commit/a4f90541c74070f30d033827789336ad27063b3a))
- add missing `jest.js` and `jest.d.ts` ([8b767c2](https://gitlab.com/html-validate/html-validate/commit/8b767c2032297b8534c7feac98414fc4d90c5bd2))

### Features

- add import `html-validate/jest` as a shortcut to the jest matchers ([4ccf6ed](https://gitlab.com/html-validate/html-validate/commit/4ccf6ed6b1da47d44bb256db4156edbdbb1ddf4e))
- expose `NodeClosed`, `TextNode`, `Plugin` and `Parser` ([f344527](https://gitlab.com/html-validate/html-validate/commit/f3445274d4e713e2c851bd524ebb429da9408abb))

# [2.15.0](https://gitlab.com/html-validate/html-validate/compare/v2.14.0...v2.15.0) (2020-02-09)

### Features

- **plugin:** load `default` transformer if loading named transformer without name ([efb0eb9](https://gitlab.com/html-validate/html-validate/commit/efb0eb9de250ad80f812bd2a0d6bd6c96d21a41a))

# [2.14.0](https://gitlab.com/html-validate/html-validate/compare/v2.13.0...v2.14.0) (2020-02-06)

### Features

- **elements:** make `<legend>` in `<fieldset>` optional (covered by new h71 rule instead) ([f3a59b9](https://gitlab.com/html-validate/html-validate/commit/f3a59b917addb05e920b30e7ce32c1be375157e2))
- **rules:** new method `getTagsDerivedFrom` to get tag and tags inheriting from it ([0118738](https://gitlab.com/html-validate/html-validate/commit/011873818a5e8997887547895a5be519baa589b0))
- **rules:** new rule `wcag/h71` requiring `<fieldset>` to have `<legend>` ([1b8ceab](https://gitlab.com/html-validate/html-validate/commit/1b8ceab724e9bb886b6b9d08a1c7563163786ad9))

# [2.13.0](https://gitlab.com/html-validate/html-validate/compare/v2.12.0...v2.13.0) (2020-02-02)

### Features

- **meta:** allow plugins to add copyable metadata ([242eaa8](https://gitlab.com/html-validate/html-validate/commit/242eaa882afb71e527b07a2a92e6d45adf4f02e7))

# [2.12.0](https://gitlab.com/html-validate/html-validate/compare/v2.11.0...v2.12.0) (2020-01-27)

### Bug Fixes

- **rules:** dont report elements where the tag is already correct ([ee354a0](https://gitlab.com/html-validate/html-validate/commit/ee354a0070f4ac6657cf0a5ce84bddadb3d2dab7)), closes [#65](https://gitlab.com/html-validate/html-validate/issues/65)

### Features

- **rules:** new rule no-redundant-role ([a32b816](https://gitlab.com/html-validate/html-validate/commit/a32b81623ac4c8603923b4ff1a41c342a5dfe1d2)), closes [#65](https://gitlab.com/html-validate/html-validate/issues/65)

# [2.11.0](https://gitlab.com/html-validate/html-validate/compare/v2.10.0...v2.11.0) (2020-01-26)

### Bug Fixes

- **dom:** use case-insensitive match for `is()` ([d2687c2](https://gitlab.com/html-validate/html-validate/commit/d2687c2e90543044f2fab5480677e6883a5b82cb))
- **plugin:** fix rule type definition ([6f0213d](https://gitlab.com/html-validate/html-validate/commit/6f0213da6f484fea9a51572592b970a7b9a0badd))

### Features

- **dom:** add `generateSelector` ([12e718e](https://gitlab.com/html-validate/html-validate/commit/12e718ec2c18eec34b5a7f9feb317d8ab07d4a13))
- **dom:** new type `DOMInternalID` ([ada3cd3](https://gitlab.com/html-validate/html-validate/commit/ada3cd31bf2fb941a5ccc72fc79515341ff5ba4a))
- **dom:** support pseudo-classes `:first-child`, `:last-child` and `:nth-child` ([af39ea1](https://gitlab.com/html-validate/html-validate/commit/af39ea1d42e2396947b5993766c15ef17481be71))
- **rules:** add selector to reported errors ([6b6ae3d](https://gitlab.com/html-validate/html-validate/commit/6b6ae3da04ae67c44bfda42081de8cbe177c5579))
- **rules:** improved reported error location for some rules ([216b449](https://gitlab.com/html-validate/html-validate/commit/216b4499220befb13b99ad28b2f8fddb811d746f))
- **shim:** expose `Report` ([6091050](https://gitlab.com/html-validate/html-validate/commit/609105017e66899f30dfddae597e9dc016984403))

# [2.10.0](https://gitlab.com/html-validate/html-validate/compare/v2.9.0...v2.10.0) (2020-01-22)

### Features

- **rules:** make options typesafe ([c85342a](https://gitlab.com/html-validate/html-validate/commit/c85342a5426ddba081fed8becaf3d4d499f0b66e))
- **rules:** new rule `prefer-native-element` ([06c44ce](https://gitlab.com/html-validate/html-validate/commit/06c44cec1c66b518c030a31517d8cfd454c0c2d2))

# [2.9.0](https://gitlab.com/html-validate/html-validate/compare/v2.8.2...v2.9.0) (2020-01-17)

### Features

- **jest:** add `toHTMLValidate()` ([44388ea](https://gitlab.com/html-validate/html-validate/commit/44388ea0f759a33831967859386299d95b528c63))
- **rules:** check references from `aria-controls` ([9e9805d](https://gitlab.com/html-validate/html-validate/commit/9e9805dc0e89e92411f7845a4fedc7ade0ca8cdd))

## [2.8.2](https://gitlab.com/html-validate/html-validate/compare/v2.8.1...v2.8.2) (2020-01-09)

### Bug Fixes

- create directory only if missing ([5db6fe8](https://gitlab.com/html-validate/html-validate/commit/5db6fe8ad82ba04d691dec5aacfcba9be8aee759))

## [2.8.1](https://gitlab.com/html-validate/html-validate/compare/v2.8.0...v2.8.1) (2020-01-06)

### Bug Fixes

- **cli:** create output directory as needed ([b5569f3](https://gitlab.com/html-validate/html-validate/commit/b5569f3abd47c02348f2aa31a430e1ab31ba65a5))
- **meta:** load metadata with `readFile` instead of `require` ([c5de95b](https://gitlab.com/html-validate/html-validate/commit/c5de95b8a41707bd58a688f130e8beecbece077a))

# [2.8.0](https://gitlab.com/html-validate/html-validate/compare/v2.7.0...v2.8.0) (2020-01-02)

### Features

- **rule:** validate matching case for start and end tags ([288cf86](https://gitlab.com/html-validate/html-validate/commit/288cf867dc6b1fdaf899cc695bb70b35c9a720a0))
- **rules:** refactor `parseStyle` from `element-case` and `attr-case` ([24d8fad](https://gitlab.com/html-validate/html-validate/commit/24d8fad19ba677502e1c19f8180efea44aa9cf34))
- **rules:** support multiple case styles ([5a397bd](https://gitlab.com/html-validate/html-validate/commit/5a397bd9aa281710f24925bec8dcc1bc29605403)), closes [#50](https://gitlab.com/html-validate/html-validate/issues/50)
- **rules:** support pascalcase and camelcase for `element-case` rule ([be7d692](https://gitlab.com/html-validate/html-validate/commit/be7d692838826a0de908d6cbb2867d02c43cee66))

# [2.7.0](https://gitlab.com/html-validate/html-validate/compare/v2.6.0...v2.7.0) (2019-12-16)

### Bug Fixes

- **config:** more helpful error when user forgot to load plugin ([62bbbe5](https://gitlab.com/html-validate/html-validate/commit/62bbbe503a5674369f24cf2a7116518b64cc2146))

### Features

- **config:** configuration schema validation ([c9fe45f](https://gitlab.com/html-validate/html-validate/commit/c9fe45fe4de2c807ec9dbed8126698f2480a7135)), closes [#61](https://gitlab.com/html-validate/html-validate/issues/61)
- **dom:** allow plugins to modify element annotation ([979da57](https://gitlab.com/html-validate/html-validate/commit/979da571ab69f22519973e7deda7531fc2560237))
- **dom:** allow plugins to modify element metadata ([cbe3e78](https://gitlab.com/html-validate/html-validate/commit/cbe3e78561e38b0abcef0a7d87a0e2aa6897ccb3)), closes [#62](https://gitlab.com/html-validate/html-validate/issues/62)
- **elements:** make schema publicly accessible ([bcab9e4](https://gitlab.com/html-validate/html-validate/commit/bcab9e4121d80fe92cdd12da84925e07e5b98297))
- **rules:** use annotated name ([1895ef4](https://gitlab.com/html-validate/html-validate/commit/1895ef4311c36cca17e8c68ebd58724df082c335))

# [2.6.0](https://gitlab.com/html-validate/html-validate/compare/v2.5.0...v2.6.0) (2019-12-12)

### Bug Fixes

- **cli:** useful error message when metadata is invalid ([165da72](https://gitlab.com/html-validate/html-validate/commit/165da729ade4f64a946b83f6cd8b57a69186f51d))
- **elements:** allow `requiredAttributes` and others to be empty array ([244d038](https://gitlab.com/html-validate/html-validate/commit/244d0384ca62a5f73985116699690dd87e3fbea1)), closes [#59](https://gitlab.com/html-validate/html-validate/issues/59)
- **error:** better schema validation error ([9a5f8fe](https://gitlab.com/html-validate/html-validate/commit/9a5f8fe0a6d7fddd53e1002c028fd0218febfede))

### Features

- **lexer:** handle rudimentary template tags such as `<% .. %>` ([a0f6190](https://gitlab.com/html-validate/html-validate/commit/a0f619045642fabac73d6fff6a1d832f37fdc075))

# [2.5.0](https://gitlab.com/html-validate/html-validate/compare/v2.4.3...v2.5.0) (2019-12-09)

### Bug Fixes

- **config:** keep track of plugin original name ([9e7ea3e](https://gitlab.com/html-validate/html-validate/commit/9e7ea3e2b36cc71c5e098004bd6e1d232b413ca7))
- **config:** throw error is plugin is missing ([bc61a6b](https://gitlab.com/html-validate/html-validate/commit/bc61a6be2684a53c1704edc62e85a401ca08c1f0))
- **htmlvalidate:** more verbose output from `--dump-source` ([f0089c6](https://gitlab.com/html-validate/html-validate/commit/f0089c68e851f85f873a0b6d741d8b36520a26ee))
- **htmlvalidate:** prefer html-validate:recommended ([8deb03a](https://gitlab.com/html-validate/html-validate/commit/8deb03a246c38afb790aff7c01db602e121baefe))

### Features

- **htmlvalidate:** new method `canValidate` to test if a file can be validated ([f523028](https://gitlab.com/html-validate/html-validate/commit/f5230285017acf3f83838c3f36293d8f5545082d))

## [2.4.3](https://gitlab.com/html-validate/html-validate/compare/v2.4.2...v2.4.3) (2019-12-08)

### Bug Fixes

- **parser:** report parser-error when stream ends before required token ([50e1d67](https://gitlab.com/html-validate/html-validate/commit/50e1d67c5c79b44d53fe3889ee76ed9577c04865))

## [2.4.2](https://gitlab.com/html-validate/html-validate/compare/v2.4.1...v2.4.2) (2019-12-05)

### Bug Fixes

- **config:** handle exceptions from loading plugin ([3aec3f3](https://gitlab.com/html-validate/html-validate/commit/3aec3f3ff019f5e3815d4b04e66ee610469e815d)), closes [#55](https://gitlab.com/html-validate/html-validate/issues/55)

## [2.4.1](https://gitlab.com/html-validate/html-validate/compare/v2.4.0...v2.4.1) (2019-12-02)

### Bug Fixes

- **lexer:** handle missing `Source` properties (like `offset`) ([2092942](https://gitlab.com/html-validate/html-validate/commit/20929425dd69eadcc5432d11f33b53a35050b76c))

# [2.4.0](https://gitlab.com/html-validate/html-validate/compare/v2.3.0...v2.4.0) (2019-12-01)

### Bug Fixes

- **config:** `init` can now safely be called multiple times ([ed46c19](https://gitlab.com/html-validate/html-validate/commit/ed46c19ef8c3f8a01a5db51f0a879f10fde597a4))
- **htmlvalidate:** initialize global config if needed ([6d05747](https://gitlab.com/html-validate/html-validate/commit/6d05747de0114b72188955a8c2a11f3816dfdc6d))

### Features

- **htmlvalidate:** retain `offset` when yielding multiple sources ([fe1705e](https://gitlab.com/html-validate/html-validate/commit/fe1705e13950c0bbb281e1806432b12d3eebed1a))
- **transform:** add `offsetToLineColumn` helper ([1e61d00](https://gitlab.com/html-validate/html-validate/commit/1e61d001fcd29d434bd2d68a7e7d9a8a12feea5b))

# [2.3.0](https://gitlab.com/html-validate/html-validate/compare/v2.2.0...v2.3.0) (2019-11-27)

### Bug Fixes

- **config:** update `--init` config for html-validate-vue@2 ([6553ded](https://gitlab.com/html-validate/html-validate/commit/6553ded78cf8cd51c8eec9ba2ef08f8e25e84612))

### Features

- **transform:** support `hasChain` to test if a transformer is present ([e8ef4f5](https://gitlab.com/html-validate/html-validate/commit/e8ef4f5e1f89c70bad43cbf5d04f47789080ab4e))

# [2.2.0](https://gitlab.com/html-validate/html-validate/compare/v2.1.0...v2.2.0) (2019-11-23)

### Bug Fixes

- **config:** throw ConfigError when elements cannot be loaded ([62c08e7](https://gitlab.com/html-validate/html-validate/commit/62c08e7c8bf9deaa47f8b9f1afbf48dcc69bba32))
- **docs:** update plugin docs ([340d0ca](https://gitlab.com/html-validate/html-validate/commit/340d0ca23875331b4267a7fd0226532904ed8fda))
- **plugin:** make all fields optional ([a587239](https://gitlab.com/html-validate/html-validate/commit/a5872397a9a0732a4cea1901c65e024767809d4a))

### Features

- **plugin:** allow specifying name ([6554f72](https://gitlab.com/html-validate/html-validate/commit/6554f72fb11e2da59ab07774f0898b20654e2a5b))

# [2.1.0](https://gitlab.com/html-validate/html-validate/compare/v2.0.1...v2.1.0) (2019-11-21)

### Bug Fixes

- **deps:** update dependency chalk to v3 ([f84bd35](https://gitlab.com/html-validate/html-validate/commit/f84bd35b637e558cdcaf01fec9ed6ebc52d895ca))
- **rules:** wcag/h32 support custom form elements ([e00e1ed](https://gitlab.com/html-validate/html-validate/commit/e00e1ed30e714b679e161308daa07df80e89edde))

### Features

- **meta:** add method to query all tags with given property ([eb3c593](https://gitlab.com/html-validate/html-validate/commit/eb3c59343efa911e4e5ed22f4eb87408e3036325))
- **meta:** adding `form` property ([edf05b0](https://gitlab.com/html-validate/html-validate/commit/edf05b09d0600be548b4d52b79421f6d13713010))
- **meta:** allow inheritance ([5c7725d](https://gitlab.com/html-validate/html-validate/commit/5c7725d5d5062e3a55fd189ccd29712bd4cc26cd))
- **meta:** support [@form](https://gitlab.com/form) category ([66d75a8](https://gitlab.com/html-validate/html-validate/commit/66d75a86783f247c62302c431ab8ce35d22b4215))

## [2.0.1](https://gitlab.com/html-validate/html-validate/compare/v2.0.0...v2.0.1) (2019-11-19)

### Bug Fixes

- **config:** better error when loading missing transformer from plugin ([db48a01](https://gitlab.com/html-validate/html-validate/commit/db48a015888a18dc2f6a17fd8466a98d29882509))
- **config:** fix loading non-plugin transformer with plugin present ([c9ad080](https://gitlab.com/html-validate/html-validate/commit/c9ad08087305a4c36821a66552d4b7389fc42e86)), closes [#54](https://gitlab.com/html-validate/html-validate/issues/54)

# [2.0.0](https://gitlab.com/html-validate/html-validate/compare/v1.16.0...v2.0.0) (2019-11-17)

### Features

- **config:** transformers must now operate on `Source` ([9c2112c](https://gitlab.com/html-validate/html-validate/commit/9c2112c8fb71275434b3d212df0953a4ea467db4))
- **config:** wrap transformer error message better ([9f833e9](https://gitlab.com/html-validate/html-validate/commit/9f833e9d4dcc17ad32cca43a546da5f62e52dfe2))
- **htmlvalidate:** string sources are now transformed too ([0645e37](https://gitlab.com/html-validate/html-validate/commit/0645e3760bd8d0f168a2c1faaa3e7097aa00b330))
- **plugin:** support exposing transformers from plugins ([1370565](https://gitlab.com/html-validate/html-validate/commit/13705651c1b00e9dbd5cc3914b317f964391d6a8))
- **transform:** add context object as `this` ([cb76cb3](https://gitlab.com/html-validate/html-validate/commit/cb76cb33664ca6e3ca37772aa14a4984faf55804))
- **transform:** add version number to API ([94a5663](https://gitlab.com/html-validate/html-validate/commit/94a5663440c904fb0ad80dcbbab60ad73c79f741))
- **transform:** adding test utils ([9e42590](https://gitlab.com/html-validate/html-validate/commit/9e42590a6112a095a0d9b01eb1af98189168f25e))
- **transform:** support chaining transformers ([4a6fd51](https://gitlab.com/html-validate/html-validate/commit/4a6fd51620621f228aa4897abded19ce1abc7d1e))
- **transform:** support returning iterators ([623b2f2](https://gitlab.com/html-validate/html-validate/commit/623b2f20efdce9ee4b3f39d1cf698d412116e79b))

### BREAKING CHANGES

- **config:** Previously transformers took a filename and had to read data of
  the file itself. Transformers will now receive a `Source` instance with the data
  preread.

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
