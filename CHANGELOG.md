# html-validate changelog

## 9.0.0-rc.7 (2024-12-18)

### Features

- refactor jest and vitest `toHTMLValidate(..)` matcher ([a6a60ab](https://gitlab.com/html-validate/html-validate/commit/a6a60ab7d973d601a19df4ccbe5538790a03f523))

## 8.28.0 (2024-12-18)

### Features

- refactor jest and vitest `toHTMLValidate(..)` matcher ([a6a60ab](https://gitlab.com/html-validate/html-validate/commit/a6a60ab7d973d601a19df4ccbe5538790a03f523))

## 9.0.0-rc.6 (2024-12-10)

- no changes

## 9.0.0-rc.5 (2024-12-09)

### Features

- **api:** `esmResolver` browser version ([5b3fc64](https://gitlab.com/html-validate/html-validate/commit/5b3fc64d693be4d30fb444ab4407dc943d309a8c))
- **api:** allow transformers to return single source ([2f85328](https://gitlab.com/html-validate/html-validate/commit/2f85328c438cb507018677bd5c7360cd73aaedc5))

## 9.0.0-rc.4 (2024-12-07)

### ⚠ BREAKING CHANGES

- **api:** `Config.merge(..)` will return a `Promise` when used with an
  async loader or resolver.
- **config:** This change affects all users. The following deprecated
  configuration presets has been removed:

* `htmlvalidate:recommended`
* `htmlvalidate:document`
* `html-validate:a17y`

- **deps:** Requires NodeJS v18 or later.
- **api:** The deprecated `tag:open` and `tag:close` events has been
  removed, use `tag:begin` and `tag:end` instead.
- **api:** The `Config.resolve()` method can return a `Promise` if any
  underlying loader or resolver has returned a `Promise`.

It is recommended to assume it returns a `Promise` and always `await` the
result:

```diff
-const resolved = config.resolve();
+const resolved = await config.resolve();
```

If you need synchronous code ensure the configuration, the loader and the
resolver all returns synchronous results, e.g. the `staticResolver` with
synchronous code.

- **api:** The `HtmlValidate.getConfigurationSchema()` method is now async
  and returns a `Promise`. If you use this method you need to await the result:

```diff
-const schema = htmlvalidate.getConfigurationSchema();
+const schema = await htmlvalidate.getConfigurationSchema();
```

- **api:** If you are writing your own transformers they may now
  optionally return a `Promise`. If you are using `test-utils` to write unit tests
  you must now resolve the promise.

```diff
 import { transformSource } from "html-validate/test-utils";

-const result = transformSource(transformer, source);
+const result = await transformSource(transformer, source);
```

This is no matter if your transformer is actually async or not.

- **api:** The `CLI.isIgnored(..)` method has been removed from the public
  API. There is no replacement. If you need this method open an issue describing
  the use-case.
- **api:** If you are using the `CLI` class most methods are now async and
  returns `Promise`. There is no synchronous version of these API calls.
- **api:** `Config.fromFile(..)` and `Config.fromObject(..)` will return a
  Promise when used with an async loader or resolver.
- **api:** `ConfigLoader` methods can optionally return a `Promise` for
  async operation. For most use-cases this will not require any changes.
- **api:** The `ConfigLoader.globalConfig` property has been replaced with
  `ConfigLoader.getGlobalConfig()` (async) and
  `ConfigLoader.getGlobalConfigSync()` (sync).
- **api:** The redundant and deprecated `Config.init()` method has been
  removed.

Remove any calls to the method:

```diff
 const config = Config.fromObject({ /* ... */ });
-config.init();
```

### Features

- **api:** `CLI.isIgnored()` made private ([911e001](https://gitlab.com/html-validate/html-validate/commit/911e001e40b2675c0ce8290bbb6ffcccfb577a5d))
- **api:** `CLI` methods async and return Promise ([8724bc8](https://gitlab.com/html-validate/html-validate/commit/8724bc849aedec9b28db2160abfcc55ec610544f))
- **api:** `Config.fromFile` and `Config.fromObject` can return `Promise` ([0ab6633](https://gitlab.com/html-validate/html-validate/commit/0ab66338a3d7ed0d855ca11490b58f75ce157343))
- **api:** `Config.merge(..)` can return `Promise` ([85ffaaf](https://gitlab.com/html-validate/html-validate/commit/85ffaaf40f6fb528cc112b0a007531265e1931f2))
- **api:** `Config.resolve()` can return `Promise` ([f2851a5](https://gitlab.com/html-validate/html-validate/commit/f2851a5e6e5ab624ed9e4e59558934c9eded6965))
- **api:** `ConfigLoader`s can optionally return `Promise` for async operation ([42d41e3](https://gitlab.com/html-validate/html-validate/commit/42d41e3b69504da03fc47549a4b272c201a44b43))
- **api:** `FileSystemConfigLoader` uses `esmResolver` by default ([c2547de](https://gitlab.com/html-validate/html-validate/commit/c2547dea0e5a36aa5aff92f363711ac970405828))
- **api:** `HtmlValidate.getConfigurationSchema()` returns promise ([950b91e](https://gitlab.com/html-validate/html-validate/commit/950b91ee1259766b8cf03aef620b46cc0e5a14c6))
- **api:** new `esmResolver` using `import(..)` ([158c336](https://gitlab.com/html-validate/html-validate/commit/158c336b3960cbb39f6c4bca13747544ea261f6a))
- **api:** remove deprecated `Config.init()` ([75860b3](https://gitlab.com/html-validate/html-validate/commit/75860b3bac5e799c404ba195f26f21ca5b01e9b1))
- **api:** remove deprecated `tag:open` and `tag:close` events ([a58a110](https://gitlab.com/html-validate/html-validate/commit/a58a110180e246f97a8b6aceffac7262cbbedd72))
- **api:** replace `ConfigLoader.globalConfig` with `ConfigLoader.getGlobalConfig()` ([93815fe](https://gitlab.com/html-validate/html-validate/commit/93815fe9ae36424de3fe32543d7b26b22ba6cc3e))
- **api:** resolvers may optionally return `Promise` for async operation ([1e9a276](https://gitlab.com/html-validate/html-validate/commit/1e9a276be962df431a4146703dcc0e312a94582b))
- **api:** transformers may optionally return `Promise` for async operation ([97f123f](https://gitlab.com/html-validate/html-validate/commit/97f123ff43c1a8b268f15d90c1764a531e86bf88))
- **cli:** use `esmResolver` ([f98aa49](https://gitlab.com/html-validate/html-validate/commit/f98aa499e5c3aee995d7f6fccc89bcae82b4c565))
- **config:** remove deprecated configuration presets ([8545475](https://gitlab.com/html-validate/html-validate/commit/8545475309d956da760b04df52ff0c80f9f996e8))
- **config:** support `.htmlvalidate.mjs` configuration files ([4d208a6](https://gitlab.com/html-validate/html-validate/commit/4d208a620793764a675ae2613161ca2f09079e82))
- **deps:** require node 18 or later ([8a21652](https://gitlab.com/html-validate/html-validate/commit/8a21652d225abe853475822a192d3023a35eb729))

### Bug Fixes

- workaround rollup issue with import attributes ([16b8265](https://gitlab.com/html-validate/html-validate/commit/16b8265818a2eab2e7641aba05665020361b857f))

## 9.0.0-rc.3 (2024-12-01)

### ⚠ BREAKING CHANGES

- **config:** This change affects all users. The following deprecated
  configuration presets has been removed:

* `htmlvalidate:recommended`
* `htmlvalidate:document`
* `html-validate:a17y`

- **deps:** Requires NodeJS v18 or later.
- **api:** The deprecated `tag:open` and `tag:close` events has been
  removed, use `tag:begin` and `tag:end` instead.
- **api:** The `Config.resolve()` method can return a `Promise` if any
  underlying loader or resolver has returned a `Promise`.

It is recommended to assume it returns a `Promise` and always `await` the
result:

```diff
-const resolved = config.resolve();
+const resolved = await config.resolve();
```

If you need synchronous code ensure the configuration, the loader and the
resolver all returns synchronous results, e.g. the `staticResolver` with
synchronous code.

- **api:** The `HtmlValidate.getConfigurationSchema()` method is now async
  and returns a `Promise`. If you use this method you need to await the result:

```diff
-const schema = htmlvalidate.getConfigurationSchema();
+const schema = await htmlvalidate.getConfigurationSchema();
```

- **api:** If you are writing your own transformers they may now
  optionally return a `Promise`. If you are using `test-utils` to write unit tests
  you must now resolve the promise.

```diff
 import { transformSource } from "html-validate/test-utils";

-const result = transformSource(transformer, source);
+const result = await transformSource(transformer, source);
```

This is no matter if your transformer is actually async or not.

- **api:** The `CLI.isIgnored(..)` method has been removed from the public
  API. There is no replacement. If you need this method open an issue describing
  the use-case.
- **api:** If you are using the `CLI` class most methods are now async and
  returns `Promise`. There is no synchronous version of these API calls.
- **api:** `Config.fromFile(..)` and `Config.fromObject(..)` will return a
  Promise when used with an async loader or resolver.
- **api:** `ConfigLoader` methods can optionally return a `Promise` for
  async operation. For most use-cases this will not require any changes.
- **api:** The `ConfigLoader.globalConfig` property has been replaced with
  `ConfigLoader.getGlobalConfig()` (async) and
  `ConfigLoader.getGlobalConfigSync()` (sync).
- **api:** The redundant and deprecated `Config.init()` method has been
  removed.

Remove any calls to the method:

```diff
 const config = Config.fromObject({ /* ... */ });
-config.init();
```

### Features

- **api:** `CLI.isIgnored()` made private ([1fdcb25](https://gitlab.com/html-validate/html-validate/commit/1fdcb25d277283f9a53ecc981fceaa13ebbd4dde))
- **api:** `CLI` methods async and return Promise ([282049e](https://gitlab.com/html-validate/html-validate/commit/282049ebd318ed7935afa46f01344e5ecb9636a4))
- **api:** `Config.fromFile` and `Config.fromObject` can return `Promise` ([5e755d6](https://gitlab.com/html-validate/html-validate/commit/5e755d6c15ff0da3fa108c7a147a4c7fd6375c6c))
- **api:** `Config.resolve()` can return `Promise` ([1e60c93](https://gitlab.com/html-validate/html-validate/commit/1e60c93527d0254af38cefec0d1fda565ef6670c))
- **api:** `ConfigLoader`s can optionally return `Promise` for async operation ([17dd44f](https://gitlab.com/html-validate/html-validate/commit/17dd44fc5ca357ea82d01116ddb95c97b55d2488))
- **api:** `HtmlValidate.getConfigurationSchema()` returns promise ([40f7d54](https://gitlab.com/html-validate/html-validate/commit/40f7d54556c6189923d325f74333f3c696d01e82))
- **api:** new `esmResolver` using `import(..)` ([ddde616](https://gitlab.com/html-validate/html-validate/commit/ddde616c602bf0710397ec1c140b05fc1ff4b816))
- **api:** remove deprecated `Config.init()` ([19de98d](https://gitlab.com/html-validate/html-validate/commit/19de98d1e1d71ecce9dd5d60d938c7877ad91ce0))
- **api:** remove deprecated `tag:open` and `tag:close` events ([5400a7b](https://gitlab.com/html-validate/html-validate/commit/5400a7b45db8a9f7dd535de5c42d6a339d33e800))
- **api:** replace `ConfigLoader.globalConfig` with `ConfigLoader.getGlobalConfig()` ([7d740d6](https://gitlab.com/html-validate/html-validate/commit/7d740d6ecee636ef516eef6c25e28752a3003769))
- **api:** resolvers may optionally return `Promise` for async operation ([9bd60b5](https://gitlab.com/html-validate/html-validate/commit/9bd60b582951bdc6ac6fa6007dcb013ccf70a6ba))
- **api:** transformers may optionally return `Promise` for async operation ([f173c3f](https://gitlab.com/html-validate/html-validate/commit/f173c3fc613c7cb445641a95a847c46e0017d769))
- **cli:** use `esmResolver` ([db36aa9](https://gitlab.com/html-validate/html-validate/commit/db36aa9b2d02d77837a384fb695afa810ad3df6c))
- **config:** remove deprecated configuration presets ([bb37eab](https://gitlab.com/html-validate/html-validate/commit/bb37eabdfa08524701362e07b58422bbe5968130))
- **config:** support `.htmlvalidate.mjs` configuration files ([e148342](https://gitlab.com/html-validate/html-validate/commit/e148342a2a4e8adb7a69ede19711f875b7fc0ace))
- **deps:** require node 18 or later ([aaf93c9](https://gitlab.com/html-validate/html-validate/commit/aaf93c93518d24de2b2b091e9d1e96e37e58cee4))

### Bug Fixes

- workaround rollup issue with import attributes ([0eee05c](https://gitlab.com/html-validate/html-validate/commit/0eee05c88a9da52ae50d5c15fc9be34d1f33071b))

## 8.27.0 (2024-11-30)

### Features

- **api:** deprecate `Config.init()` ([d4b5987](https://gitlab.com/html-validate/html-validate/commit/d4b5987a92da01a2373354373544a3f256996391))
- **config:** lazy load transformers ([d82bc57](https://gitlab.com/html-validate/html-validate/commit/d82bc57d3d86849151d7b4db286b93deab21c4d9)), closes [#194](https://gitlab.com/html-validate/html-validate/issues/194)

## 8.26.0 (2024-11-26)

### Features

- better handling of mismatched/unclosed tags ([489ccae](https://gitlab.com/html-validate/html-validate/commit/489ccae62cfc37126ca45025ebf34619b109f257)), closes [#272](https://gitlab.com/html-validate/html-validate/issues/272)

## 8.25.1 (2024-11-24)

### Bug Fixes

- fix dump tree output with nested elements ([854c274](https://gitlab.com/html-validate/html-validate/commit/854c2745deb2076514ae7c01a18dbdfbc42648c9))

## 8.25.0 (2024-11-11)

### Features

- **cli:** add `--preset` to set preset when using cli ([2ec038f](https://gitlab.com/html-validate/html-validate/commit/2ec038fea2ec7e03b1cc1b5ede73fac37aa70e7e)), closes [#269](https://gitlab.com/html-validate/html-validate/issues/269)

### Bug Fixes

- properly close elements with optional end tag when implicit document element is used ([bbe2a99](https://gitlab.com/html-validate/html-validate/commit/bbe2a994215534214bf3a70a4294c7c8b8279811)), closes [#268](https://gitlab.com/html-validate/html-validate/issues/268)
- **types:** narrow numeric rule severity to only 0, 1 and 2 ([88cf8a2](https://gitlab.com/html-validate/html-validate/commit/88cf8a2aaac81d86c75804d809b7d15f1632ebb7))

## 8.24.2 (2024-10-16)

### Bug Fixes

- add default environment to `package.json` exports ([a21a1ef](https://gitlab.com/html-validate/html-validate/commit/a21a1ef2b900ee7a897abbb71bfb358ea9a84872)), closes [#265](https://gitlab.com/html-validate/html-validate/issues/265)

## 8.24.1 (2024-10-07)

### Bug Fixes

- dont validate quotes in dynamically added attributes ([2125d86](https://gitlab.com/html-validate/html-validate/commit/2125d8640f39bce5627510bfa7cd2597628d9ae5))

## 8.24.0 (2024-09-24)

### Features

- new `html-validate:browser` configuration preset ([f4e6f5b](https://gitlab.com/html-validate/html-validate/commit/f4e6f5ba3b57a278ef6c59a4e5e65ec602b2f9de)), closes [#261](https://gitlab.com/html-validate/html-validate/issues/261)

## 8.23.0 (2024-09-22)

### Features

- **deps:** support vitest v2 ([860b0c0](https://gitlab.com/html-validate/html-validate/commit/860b0c02510ef7e40cd2fd54b7f83143643b3718))

## 9.0.0-rc.2 (2024-09-21)

### ⚠ BREAKING CHANGES

- **api:** This change affects API users only. `Config.fromFile(..)` and
  `Config.fromObject(..)` will return a Promise when used with an async loader or resolver.
- **api:** This change affects API users only. `ConfigLoader` methods can
  optionally return a `Promise` for async operation. For most use-cases this will
  not require any changes.
- **api:** This change affects API users only. The
  `ConfigLoader.globalConfig` property has been replaced with
  `ConfigLoader.getGlobalConfig()` (async) and
  `ConfigLoader.getGlobalConfigSync()` (sync).

### Features

- **api:** `Config.fromFile` and `Config.fromObject` can return `Promise` ([2d827f8](https://gitlab.com/html-validate/html-validate/commit/2d827f8ebbcc80b6371e34490cc29a60ccb06f19))
- **api:** `ConfigLoader`s can optionally return `Promise` for async operation ([ccea523](https://gitlab.com/html-validate/html-validate/commit/ccea523734ec394a7da7f384f269e058af957081))
- **api:** replace `ConfigLoader.globalConfig` with `ConfigLoader.getGlobalConfig()` ([404d44e](https://gitlab.com/html-validate/html-validate/commit/404d44eb42a182c5b197d6117f967d98fc76f3ae))

## 9.0.0-rc.1 (2024-09-09)

### ⚠ BREAKING CHANGES

- **api:** This change only affects API users. The
  `ConfigLoader.getConfigFor()` method may now optionally return and asynchronous
  `Promise`. For most use-cases this will not require any changes.

### Features

- **api:** `ConfigLoader.getConfigFor()` may return Promise-based async results ([eb05356](https://gitlab.com/html-validate/html-validate/commit/eb05356c624533ae4ff629a5e25a5a4084b802de))

## 8.22.0 (2024-09-09)

### Features

- **api:** make `DOMNode` constructor internal ([13377ac](https://gitlab.com/html-validate/html-validate/commit/13377ac2eb93b1d03557108015295d0e9d229ac2))
- **api:** make `HtmlElement` constructor private ([fbf4303](https://gitlab.com/html-validate/html-validate/commit/fbf4303fd44541c072be44ce3cafec1ddb848436))
- **deps:** drop `@babel/code-frame` dependency ([0003ffd](https://gitlab.com/html-validate/html-validate/commit/0003ffdb9f4e912f729e436312c727fa94d5a40a))
- **deps:** update @sidvind/better-ajv-errors to v3 ([3112289](https://gitlab.com/html-validate/html-validate/commit/3112289525b119ff0bb0b4ab47bb2d59a2993d30))

### Bug Fixes

- **deps:** update dependency ignore to v5.3.2 ([9d86e68](https://gitlab.com/html-validate/html-validate/commit/9d86e685640b1f24412f85d8a4513a7ea1f01725))

## 8.21.0 (2024-07-20)

### Features

- **api:** add `DOMTree.readyState` ([1f6f69b](https://gitlab.com/html-validate/html-validate/commit/1f6f69b7fdb0e70c874d649b5d5dd5382838c068))
- **api:** deprecate `DOMTree.find(..)` in favour of `querySelector(..)` ([ac0bb77](https://gitlab.com/html-validate/html-validate/commit/ac0bb77a3eef19d82bf2e6aaced76dd90eef42a5))
- **api:** internal methods of `DOMTree` removed from public API ([79a03be](https://gitlab.com/html-validate/html-validate/commit/79a03be60459ac01728e33017da7829bad323b13))
- **api:** new `walk.depthFirst(..)` API to replace now deprecated `DOMTree.visitDepthFirst(..)` method ([f9dbda0](https://gitlab.com/html-validate/html-validate/commit/f9dbda0a3c7e189d72d2f7870dc7c7074db7f7a2))

### Bug Fixes

- **html5:** `spellcheck` is a global attribute ([46594a1](https://gitlab.com/html-validate/html-validate/commit/46594a18fa3db2b85c496026bf1e9bd4eaa45b78))

## 8.20.1 (2024-06-11)

### Bug Fixes

- **rules:** fix `attribute-allowed-values` error location for empty values ([2c04eeb](https://gitlab.com/html-validate/html-validate/commit/2c04eeb3d855c6365dea7fa7abfb44e4fb19bf42))

## 8.20.0 (2024-06-02)

### Features

- **api:** new `setConfig` method on `StaticConfigLoader` to change config ([1bf7559](https://gitlab.com/html-validate/html-validate/commit/1bf75594ee6c984fd38d94bb844887629528dbef))
- **api:** new getter/setter for configuration loader ([6283091](https://gitlab.com/html-validate/html-validate/commit/628309112f0dd5a28ab44c5dacbb32a47535128b))

## 8.19.1 (2024-05-23)

### Bug Fixes

- **rules:** `wcag/h36` no longer reports for hidden elements ([aba06d1](https://gitlab.com/html-validate/html-validate/commit/aba06d1e99a6580f53f696e79a9a47c28837bddb))
- **rules:** `wcag/h37` no longer validates `<input type="submit">` (use `wcag/h36` instead) ([e82b17a](https://gitlab.com/html-validate/html-validate/commit/e82b17a11a1cdc94e12b9fc6f99fcc2e27e3bc5e)), closes [#254](https://gitlab.com/html-validate/html-validate/issues/254)
- **rules:** make `wcag/h36` have better message and location ([8a80cc8](https://gitlab.com/html-validate/html-validate/commit/8a80cc8582fbf9af1e6378301f86eb9cd577924c))

## 8.19.0 (2024-05-18)

### Features

- **rules:** new option `allowCheckboxDefault` for `form-dup-name` ([293b951](https://gitlab.com/html-validate/html-validate/commit/293b951073a78af3c7a26d4ccf2472eed6178828)), closes [#251](https://gitlab.com/html-validate/html-validate/issues/251)

### Bug Fixes

- **rules:** `multiple-labeled-controls` handles hidden input ([4d794b6](https://gitlab.com/html-validate/html-validate/commit/4d794b6911cc8d977d008eaaad5d0d9996a9c662)), closes [#251](https://gitlab.com/html-validate/html-validate/issues/251)
- **rules:** `wcag/h30` only applies to `<a href>` ([cd93dfe](https://gitlab.com/html-validate/html-validate/commit/cd93dfe591e6f833516ddcae086c7587ed3d103c)), closes [#252](https://gitlab.com/html-validate/html-validate/issues/252)
- **rules:** handle unicode letters in `valid-id` ([c83687a](https://gitlab.com/html-validate/html-validate/commit/c83687abc26b84a0e026caad8781656db6ac0339)), closes [#253](https://gitlab.com/html-validate/html-validate/issues/253)

## 8.18.2 (2024-04-20)

### Bug Fixes

- **html5:** allow textarea to have autocomplete values other than `on` and `off` ([c1dfbb1](https://gitlab.com/html-validate/html-validate/commit/c1dfbb18c16f41b995fbb5054381c7396f035877)), closes [#249](https://gitlab.com/html-validate/html-validate/issues/249)

## 8.18.1 (2024-03-30)

### Bug Fixes

- **rules:** `form-dup-name` handles `<template>` element ([9c77444](https://gitlab.com/html-validate/html-validate/commit/9c77444a3abb4098bf7a4d7eeececb680eedc533)), closes [#247](https://gitlab.com/html-validate/html-validate/issues/247)
- **rules:** `no-dup-id` handles `<template>` element ([04f3e0d](https://gitlab.com/html-validate/html-validate/commit/04f3e0d1c5cccf28a6aadeb3fab5480cf97a6683)), closes [#247](https://gitlab.com/html-validate/html-validate/issues/247)

## 8.18.0 (2024-03-23)

### Features

- **rules:** new pattern `bem` for pattern rules ([c1ead1b](https://gitlab.com/html-validate/html-validate/commit/c1ead1b6f569a60cd135ef73134ed6f6a66ad598))
- **rules:** new pattern `snakecase` for pattern rules ([4b95ccb](https://gitlab.com/html-validate/html-validate/commit/4b95ccb5c90cb496e2b00b6ab6cf71aad20f3275)), closes [#245](https://gitlab.com/html-validate/html-validate/issues/245)

### Bug Fixes

- **rules:** disallow consecutive hyphens and underscors for kebab-case and snake_case ([a4338a7](https://gitlab.com/html-validate/html-validate/commit/a4338a7b0bccd2a16c93026980b1ef6c5d279ec3)), closes [#246](https://gitlab.com/html-validate/html-validate/issues/246)
- **rules:** require initial character for all patterns to be letter ([646ff16](https://gitlab.com/html-validate/html-validate/commit/646ff16b144ef5ceedecec994bb1904aa5f0396d))

## 8.17.1 (2024-03-21)

### Bug Fixes

- **rules:** properly handle inert on ancestor elements ([2990669](https://gitlab.com/html-validate/html-validate/commit/2990669d8a0e23589f45ed337b20bed1974fb93e)), closes [#243](https://gitlab.com/html-validate/html-validate/issues/243)

## 8.17.0 (2024-03-19)

### Features

- **rules:** new rule `name-pattern` ([f2209c0](https://gitlab.com/html-validate/html-validate/commit/f2209c04891c7c7e046edb82e9dab1a739409a2c)), closes [#216](https://gitlab.com/html-validate/html-validate/issues/216)
- **rules:** support multiple patterns in `id-pattern`, `class-pattern` and `name-pattern` rules ([15dd007](https://gitlab.com/html-validate/html-validate/commit/15dd00727bb7665d2d53983bf7aca9269e6ff7cb))

### Bug Fixes

- **meta:** handle regexp with slash inside ([4c88396](https://gitlab.com/html-validate/html-validate/commit/4c883962af750ba0c02c221fad80141b9f0d614f)), closes [#242](https://gitlab.com/html-validate/html-validate/issues/242)
- **rules:** `input-missing-label` now ignores `<input>` hidden by css ([c40e48e](https://gitlab.com/html-validate/html-validate/commit/c40e48ed546462cd3bf7e2e700dbb10c6743fdd3)), closes [#241](https://gitlab.com/html-validate/html-validate/issues/241)
- **rules:** `input-missing-label` now tests if `<label>` is inert or hidden by css ([d0d6f40](https://gitlab.com/html-validate/html-validate/commit/d0d6f403ca5d06cf42d60098c9cbd8a2b1741cdb))
- **rules:** show pattern name in `id-pattern`, `class-pattern` and `name-pattern` rules ([4bd70ab](https://gitlab.com/html-validate/html-validate/commit/4bd70ab45d4e9d4f8a8a7ccb4b9b6fc41e23bc1a))

## 8.16.0 (2024-03-18)

### Features

- **api:** new `tabIndex` property reflecting the parsed `tabindex` attribute ([a4e5d5b](https://gitlab.com/html-validate/html-validate/commit/a4e5d5b0acfc9f01656d75e0c1c4c0640fbed138))
- **meta:** add `inert` as global attribute ([a5e6477](https://gitlab.com/html-validate/html-validate/commit/a5e647739d1f87939fdbef244e251cfdfb257d0d))
- **meta:** new `formAssociated.disablable` property ([0b141ab](https://gitlab.com/html-validate/html-validate/commit/0b141abab87bec2270c949840192915a9d594b73))

### Bug Fixes

- **html5:** `<summary>` element is focusable if child of `<details>` ([79dec74](https://gitlab.com/html-validate/html-validate/commit/79dec7460e07ee7870d2cc78b86f66011f0d25df))
- **rules:** `hidden-focusable` handles inert elements ([89bb969](https://gitlab.com/html-validate/html-validate/commit/89bb96903d36b1dfd883e6a2d82dfb0f30742b44)), closes [#240](https://gitlab.com/html-validate/html-validate/issues/240)
- **rules:** `hidden-focusable` no longer reports for disabled form controls ([d337397](https://gitlab.com/html-validate/html-validate/commit/d3373974b3f57121723debc5823bb57e2ec22843))
- **rules:** `hidden-focusable` no longer reports for elements with `tabindex="-1"` ([03d7223](https://gitlab.com/html-validate/html-validate/commit/03d7223fed7e0988b0749b2bb5cde53eb848bc4a)), closes [#240](https://gitlab.com/html-validate/html-validate/issues/240)

## 8.15.0 (2024-03-11)

### Features

- **rules:** new rule `valid-autocomplete` ([bebd0d1](https://gitlab.com/html-validate/html-validate/commit/bebd0d17f6dd71401206ebf2e3b8e9271bc0c8a8))

### Bug Fixes

- **rules:** case-insensitive match for `url` in `meta-refresh` ([3177295](https://gitlab.com/html-validate/html-validate/commit/3177295c3fff37116b869bedc8588a8fb2a6c9d5))

## 8.14.0 (2024-03-09)

### Features

- **rules:** new option `allowLongDelay` to `meta-refresh` to allow 20h+ delays ([629625c](https://gitlab.com/html-validate/html-validate/commit/629625c80851b7325e9528e8c5902c903638af12))

## 8.13.0 (2024-03-06)

### Features

- **meta:** allow `<link>` under `<body>` if appropriate `rel` attribute is present ([ae1e070](https://gitlab.com/html-validate/html-validate/commit/ae1e0707f9438183f5200e67e263f7a52cfbbf99))
- **meta:** allow content categories to be a callback ([0eb4e77](https://gitlab.com/html-validate/html-validate/commit/0eb4e77f3ea1f04bf1a368da037df7c906f51c3e))
- **meta:** disallow invalid rel attribute keywords ([dc36cfb](https://gitlab.com/html-validate/html-validate/commit/dc36cfbdce01c9d6af49303a9ca7a5a627b5035a))

## 8.12.0 (2024-03-04)

### Features

- **rules:** new rule `no-abstract-role` ([923680b](https://gitlab.com/html-validate/html-validate/commit/923680bad97a01e897343ebc254c89820c93bd2c))

## 8.11.1 (2024-02-26)

### Bug Fixes

- **dom:** fix regression error with selectors ending with characters `a`, `d` or `9` ([a9a9ef9](https://gitlab.com/html-validate/html-validate/commit/a9a9ef9541fb58291576f697a385e5d378f16c8f))

## 8.11.0 (2024-02-26)

### Features

- **html5:** add new property `aria.naming` representing if the element can be named ([4fca264](https://gitlab.com/html-validate/html-validate/commit/4fca2643ad9fa9a21c5790407789bf6fa3e89843))
- **html5:** update role metadata from html-aria standard ([b029a3f](https://gitlab.com/html-validate/html-validate/commit/b029a3fab93e7fab9838af491697b02dbfa11ea9))
- **meta:** move `implicitRole` to `aria.implicitRole` ([bc8cacf](https://gitlab.com/html-validate/html-validate/commit/bc8cacf096ede336ca2cc8f387662ffeb5bb633d))

### Bug Fixes

- handle selectors containing tabs and newlines ([5e45d54](https://gitlab.com/html-validate/html-validate/commit/5e45d54574f283916c2fed4bb26c429497484a00)), closes [#238](https://gitlab.com/html-validate/html-validate/issues/238)
- **rules:** new option `allowAnyNamable` for `aria-label-misuse` ([c08a3ba](https://gitlab.com/html-validate/html-validate/commit/c08a3ba9906fec5119aa9dffe154207769e50319)), closes [#237](https://gitlab.com/html-validate/html-validate/issues/237)

## 8.10.0 (2024-02-21)

### Features

- **rules:** new rule `no-implicit-input-type` ([6cc0c6d](https://gitlab.com/html-validate/html-validate/commit/6cc0c6d1b2ad1627ce41af1a998a60da5872fe17))

### Bug Fixes

- **deps:** update dependency ignore to v5.3.1 ([4553b89](https://gitlab.com/html-validate/html-validate/commit/4553b89a470008789b0bf3569021c493a4db0c97))
- **html5:** `type` for `<input>` no longer required ([37284d0](https://gitlab.com/html-validate/html-validate/commit/37284d043a5145ae75d34bf0dbe79e173b0d54db)), closes [#235](https://gitlab.com/html-validate/html-validate/issues/235)
- **rules:** change wording required to recommended in `no-implicit-button-type` ([1926c06](https://gitlab.com/html-validate/html-validate/commit/1926c061e3e37221cbc63fd3926c110926780a4d))

## 8.9.1 (2024-01-10)

### Bug Fixes

- **rules:** `<form>` and `<section>` without explicit accessible name is no longer considered landmark ([a36deac](https://gitlab.com/html-validate/html-validate/commit/a36deac9e7a53f09e73e6575a9dcf098eb63bdda))
- **rules:** `<header>` and `<footer>` nested in `<main>` or sectioning content is no longer considered landmark ([bcab354](https://gitlab.com/html-validate/html-validate/commit/bcab354dd201cffabb3352c8b13f5985c99b777c)), closes [#234](https://gitlab.com/html-validate/html-validate/issues/234)

## 8.9.0 (2024-01-08)

### Features

- **elements:** new property `focusable` to mark elements as focusable ([c59c8b2](https://gitlab.com/html-validate/html-validate/commit/c59c8b237272376fce60c1fd1f4f105b29952238))
- **rules:** new rule `hidden-focusable` ([243e7fb](https://gitlab.com/html-validate/html-validate/commit/243e7fbbe0da541e534215f4e68455280a267307))
- **rules:** new rule `unique-landmark` ([187be1e](https://gitlab.com/html-validate/html-validate/commit/187be1ec11a5bc3d7dc7b1a4dcc31058dc43cea6))

### Bug Fixes

- **api:** remove internal `listeners` property from public API ([303e5d5](https://gitlab.com/html-validate/html-validate/commit/303e5d513b243280c8ed2cb442b1223fe83286ec))
- **dom:** ancestor with `role="presentation"` no longer counts decendants as missing from a11y tree ([cc72da1](https://gitlab.com/html-validate/html-validate/commit/cc72da1b0eab0ba28a5bc8984077684c6f23474f))
- **dom:** handle `role="none"` as a synonym for `role="presentation"` ([b1d7b50](https://gitlab.com/html-validate/html-validate/commit/b1d7b50e86b1867cc17a194b680a11e7f8d43e8c))
- **dom:** interactive and focusable elements ignore `role="presentation"` ([017308f](https://gitlab.com/html-validate/html-validate/commit/017308faab0a5d75a8e009c59923434a44a141bf))
- **rules:** better error description for `require-sri` ([ffc3695](https://gitlab.com/html-validate/html-validate/commit/ffc3695febcc17df8c905867d1af95c5511b2a70))
- **rules:** rule `wcag/h30` no longer requires text on `<a hidden>` ([a20cc84](https://gitlab.com/html-validate/html-validate/commit/a20cc84870cfd848e282c41c47bb2a4f8610289b))
- **rules:** rule `wcag/h30` no longer requires text on links with `display: none` or `visibility: hidden` ([36ff07e](https://gitlab.com/html-validate/html-validate/commit/36ff07e968df97be62a2a83fd373b1fca2b8b974))
- **rules:** rules `wcag/h32` handles `<button>` without explicit `type` ([84c6a6e](https://gitlab.com/html-validate/html-validate/commit/84c6a6e66c946e4bcfc990b0cb7b032f4ea5ca8b))

## 8.8.0 (2023-12-27)

### Features

- **api:** `Report.merge()` can merge async results ([35689fc](https://gitlab.com/html-validate/html-validate/commit/35689fc10b8ecfe4ad27818db23fa54a10b4a90e))
- **api:** rename `nodejsResolver` to `cjsResolver` ([8c72c8f](https://gitlab.com/html-validate/html-validate/commit/8c72c8f404994612ebf40e35351af3e8bc87a2b9))
- **config:** new `defineConfig` helper ([35e265a](https://gitlab.com/html-validate/html-validate/commit/35e265af0df61ca90d51b2c6851ad009b674bac2))

### Bug Fixes

- **config:** proper error message when certain configuration properties was invalid ([b029569](https://gitlab.com/html-validate/html-validate/commit/b029569d6db043ddde57bca59a71e47aa5801877))

## 8.7.4 (2023-12-10)

### Bug Fixes

- **deps:** pin @sidvind/better-ajv-errors ([94f778b](https://gitlab.com/html-validate/html-validate/commit/94f778b9748bea0c9de7f4201d45ec196f1c8d31)), closes [#231](https://gitlab.com/html-validate/html-validate/issues/231)
- **deps:** support vitest v1 ([4cc4d23](https://gitlab.com/html-validate/html-validate/commit/4cc4d233724fa8dfaab5a8c4f83d297d2851ee8b))

## 8.7.3 (2023-11-23)

### Bug Fixes

- disable `doctype-style` when using prettier preset ([f1f4004](https://gitlab.com/html-validate/html-validate/commit/f1f40044057696330cb5533be8594adf61b2f87f))

## 8.7.2 (2023-11-18)

### Bug Fixes

- **deps:** update dependency ignore to v5.3.0 ([143e994](https://gitlab.com/html-validate/html-validate/commit/143e99445c91a0277ea163cd2450608fbe87f2af))

## 8.7.1 (2023-11-11)

### Bug Fixes

- **rules:** fix `form-dup-name` issue when more than two names are present in array ([5d9ff3b](https://gitlab.com/html-validate/html-validate/commit/5d9ff3bdeef483199580cd18d06477443f47f771)), closes [#228](https://gitlab.com/html-validate/html-validate/issues/228)

## 8.7.0 (2023-10-21)

### Features

- **html5:** support `referrerpolicy` attribute ([851b559](https://gitlab.com/html-validate/html-validate/commit/851b55910d42a8c49f9fc60e5b4ba7836b548125))

## 8.6.1 (2023-10-21)

### Bug Fixes

- **dom:** remove usage of regex negative lookbehind ([f406393](https://gitlab.com/html-validate/html-validate/commit/f406393a2dc2b5cb7e7e5cbf009f89bf4d115f06)), closes [#147](https://gitlab.com/html-validate/html-validate/issues/147)
- **rules:** improve `attribute-misuse` error message ([fccce69](https://gitlab.com/html-validate/html-validate/commit/fccce69ab32910f3c90bcc4e7b9312342f2e18a9)), closes [#226](https://gitlab.com/html-validate/html-validate/issues/226)
- typo in CONTRIBUTING.md ([855bacf](https://gitlab.com/html-validate/html-validate/commit/855bacf62cc7d1c54cbdf926f036f0b7ba912437))

## 8.6.0 (2023-10-13)

### Features

- **api:** add `meta: MetaAttribute` in `AttributeEvent` ([2cda0ae](https://gitlab.com/html-validate/html-validate/commit/2cda0aece349c573824c44e75c552a0eee75f279))
- **cli:** `--rule` severity can now be set with strings, fixes [#225](https://gitlab.com/html-validate/html-validate/issues/225). ([054972e](https://gitlab.com/html-validate/html-validate/commit/054972e9ffe0da02c8b63f8a47aaca333fc9a0d7))

## 8.5.0 (2023-10-01)

### Features

- experimental vitest support ([44cf449](https://gitlab.com/html-validate/html-validate/commit/44cf449af035fcfad41a1c3d8612650cce09c679)), closes [#188](https://gitlab.com/html-validate/html-validate/issues/188)

## 8.4.1 (2023-09-23)

### Bug Fixes

- **rules:** fix contextual documentation for `attr-pattern` rule ([0082aef](https://gitlab.com/html-validate/html-validate/commit/0082aefe4c527c0dfdbecf3393b3561d2d20240e))

## 8.4.0 (2023-09-09)

### Features

- **html5:** support `<search>` element ([720bdd9](https://gitlab.com/html-validate/html-validate/commit/720bdd9cd37a47a3b1e1e5221d1330b29ec27b34))
- new `implicitRole` metadata for better handling of implicit ARIA roles ([fe45ec4](https://gitlab.com/html-validate/html-validate/commit/fe45ec49775f277016b91e69aee135f6dba0ed14)), closes [#224](https://gitlab.com/html-validate/html-validate/issues/224)

## 8.3.0 (2023-08-20)

### Features

- **rules:** new rule `no-implicit-button-type` ([38efd72](https://gitlab.com/html-validate/html-validate/commit/38efd723e8621b660ded7cb151afc6619b1fc483)), closes [#221](https://gitlab.com/html-validate/html-validate/issues/221)

### Bug Fixes

- **html5:** `<label>` cannot have empty `for` ([3626e1a](https://gitlab.com/html-validate/html-validate/commit/3626e1a96abe2681bec03d6fe67171119e8d3628)), closes [#223](https://gitlab.com/html-validate/html-validate/issues/223)
- **html5:** `element-required-attributes` allows `<button>` without `type` (use `no-implicit-button-type` instead) ([d32f492](https://gitlab.com/html-validate/html-validate/commit/d32f49260ae77d8a128acebaad7c55de0cfc945a)), closes [#221](https://gitlab.com/html-validate/html-validate/issues/221)

## 8.2.0 (2023-08-07)

### Features

- add `allowedIfParentIsPresent` metadata helper ([2668899](https://gitlab.com/html-validate/html-validate/commit/26688993dbf76c6b02bc01cca44b07236d24b456))
- **html5:** add `<source>` attributes metadata ([e3a3311](https://gitlab.com/html-validate/html-validate/commit/e3a3311d220074c988be85ce0f18c973380fddc7))
- support passing native `HTMLElement` to metadata helpers ([8af6d01](https://gitlab.com/html-validate/html-validate/commit/8af6d01d3145edf4028195326b96858d2da33872)), closes [#207](https://gitlab.com/html-validate/html-validate/issues/207)

### Bug Fixes

- **api:** typing for `Rule.setSeverity()` changed to only accept `Severity` ([64f4210](https://gitlab.com/html-validate/html-validate/commit/64f42104bde8100e036e8c25232798c6741a193a))

## 8.1.0 (2023-07-22)

### Features

- **rules:** new rule `no-redundant-aria-label` ([59b5bab](https://gitlab.com/html-validate/html-validate/commit/59b5bab633239662115a20bfa8a717418668f7ec)), closes [#206](https://gitlab.com/html-validate/html-validate/issues/206)

### Bug Fixes

- add `compatibilityCheck` function to browser bundle ([b89dcc2](https://gitlab.com/html-validate/html-validate/commit/b89dcc2d06cba623ebd6c8ff5319b938fec59da4))
- **api:** remove unintended `null` return value from plugins api ([0eb0ea8](https://gitlab.com/html-validate/html-validate/commit/0eb0ea802a1185fed658f0cccc1068a877ed9296))

## 8.0.5 (2023-06-13)

### Bug Fixes

- fix import issue with `elements/html5.js` ([0604c21](https://gitlab.com/html-validate/html-validate/commit/0604c21e87a5b279c5aaf034640644daf39f48a2)), closes [#219](https://gitlab.com/html-validate/html-validate/issues/219)
- make `elements/html5` work with esm ([d95de27](https://gitlab.com/html-validate/html-validate/commit/d95de2716829d6fca4c8c6e291746a41fa5eb7f5))

## 8.0.4 (2023-06-12)

### Bug Fixes

- add explicit node import ([73f9a1f](https://gitlab.com/html-validate/html-validate/commit/73f9a1f2cc3f532c48e501df49ff1bc5465cc569))

## 8.0.3 (2023-06-12)

### Bug Fixes

- fix regression bug when using `elements` in extended configuration files and plugins ([6892083](https://gitlab.com/html-validate/html-validate/commit/6892083c8017db0338196e9cafdf71a7a133fb05))
- use correct dts when using custom conditions ([1b6971e](https://gitlab.com/html-validate/html-validate/commit/1b6971e0f7e76fbae600457bf37247549239e3f7))

## 8.0.2 (2023-06-10)

### Bug Fixes

- add `browser` condition for main import ([d2f7a74](https://gitlab.com/html-validate/html-validate/commit/d2f7a74d455c0db0c07c2441a624f372c1bd30bb))
- remove usage of `node:path` and `process` in browser build ([2580aeb](https://gitlab.com/html-validate/html-validate/commit/2580aeb032cccab3b32a066bb78dae00b268c899))

## 8.0.1 (2023-06-10)

### Bug Fixes

- fix nodejs code being included in browser bundle ([7c76a3b](https://gitlab.com/html-validate/html-validate/commit/7c76a3b52bfd1586bcc2cae59dce366d983363ca))

## 8.0.0 (2023-06-04)

### ⚠ BREAKING CHANGES

See {@link migration migration guide} for details.

- **api:** The `ConfigFactory` parameter to `ConfigLoader` (and its child
  classes `StaticConfigLoader` and `FileSystemConfigLoader`) has been removed. No
  replacement.

If you are using this you are probably better off implementing a fully custom
loader later returning a `ResolvedConfig`.

- **api:** A new `getContextualDocumentation` replaces the now deprecated
  `getRuleDocumentation` method. The context parameter to `getRuleDocumentation`
  is now required and must not be omitted.

For rule authors this means you can now rely on the `context` parameter being
set in the `documentation` callback.

For IDE integration and toolchain authors this means you should migrate to use
`getContextualDocumentation` as soon as possible or if you are continuing to use
`getRuleDocumentation` you are now required to pass the `config` and `context`
field from the reported message.

- **api:** This change affect API users only, specifically API users
  directly using the `Config` class. Additionally when using the
  `StaticConfigLoader` no modules will be resolved using `require(..)` by default
  any longer. Instructions for running in a browser is also updated, see below.

To create a `Config` instance you must now pass in a `Resolver` (single or
array):

```diff
+const resolvers = [ /* ... */ ];
-const config = new Config( /* ... */ );
+const config = new Config(resolvers, /* ... */ );
```

This applies to calls to `Config.fromObject(..)` as well.

The default resolvers for `StaticConfigLoader` is `StaticResolver` and for
`FileSystemConfigLoader` is `NodeJSResolver`. Both can optionally take a new set
of resolvers (including custom ones).

Each resolver will, in order, try to load things by name. For instance, when
using the `NodeJSResolver` it uses `require(..)` to load new items.

- `NodeJSResolver` - uses `require(..)`
- `StaticResolver` - uses a predefined set of items.
- **api:** The `HtmlValidate` class now has a `Promise` based API where most
  methods return a promise. The old synchronous methods are renamed.

Either adapt to the new asynchronous API:

```diff
-const result = htmlvalidate.validateFile("my-awesome-file.html");
+const result = await htmlvalidate.validateFile("my-awesome-file.html");
```

or migrate to the synchronous API:

```diff
-const result = htmlvalidate.validateFile("my-awesome-file.html");
+const result = htmlvalidate.validateFileSync("my-awesome-file.html");
```

For unittesting with Jest it is recommended to make the entire test-case async:

```diff
-it("my awesome test", () => {
+it("my awesome test", async () => {
   const htmlvalidate = new HtmlValidate();
-  const report = htmlvalidate.validateString("...");
+  const report = await htmlvalidate.validateString("...");
   expect(report).toMatchCodeFrame();
});
```

- **api:** `ConfigLoader` must return `ResolvedConfig`. This change
  affects API users who implements custom configuration loaders.

In the simplest case this only requires to call `Config.resolve()`:

```diff
-return config;
+return config.resolve();
```

A resolved configuration cannot further reference any new files to extend,
plugins to load, etc.

- **api:** The `TemplateExtractor` class has been moved to the
  `@html-validate/plugin-utils` package. This change only affects API users who
  use the `TemplateExtractor` class, typically this is only used when writing
  plugins.
- **config:** Deprecated severity alias `disabled` removed. If you use this in your
  configuration you need to update it to `off`.

```diff
 {
   "rules": {
-    "my-awesome-rule": "disabled"
+    "my-awesome-rule": "off"
   }
 }
```

- **rules:** The `void` rule has been removed after being deprecated a long
  time, it is replaced with the separate `void-content`, `void-style` and
  `no-self-closing` rules.
- **deps:** minimum required node version is v16
- **deps:** minimum required jest version is v27

### Features

- **api:** `ConfigLoader` must return `ResolvedConfig` ([d685e6a](https://gitlab.com/html-validate/html-validate/commit/d685e6a2360a2bc26cd63b43125954224a4396ba))
- **api:** `FileSystemConfigLoader` supports passing a custom `fs`-like object ([fac704e](https://gitlab.com/html-validate/html-validate/commit/fac704ec335c47cc3bb062ea9b505999c76aa201))
- **api:** add `Promise` based API to `HtmlValidate` class ([adc7783](https://gitlab.com/html-validate/html-validate/commit/adc7783487541ad746039e921465959bd5443749))
- **api:** add `Resolver` classes as a mean to separate `fs` from browser build ([3dc1724](https://gitlab.com/html-validate/html-validate/commit/3dc17240f62e449c1204f3feddc80f78ef65b3ed))
- **api:** new `getContextualDocumentation` to replace `getRuleDocumentation` ([60c9a12](https://gitlab.com/html-validate/html-validate/commit/60c9a124c0a1414ff51ea310fc4e5ce042eea688))
- **api:** remove `ConfigFactory` ([e309d89](https://gitlab.com/html-validate/html-validate/commit/e309d890473907d58fa099e14f365f56be76b819))
- **api:** remove `TemplateExtractor` in favour of `@html-validate/plugin-utils` ([a0a512b](https://gitlab.com/html-validate/html-validate/commit/a0a512b945acb7596ee207f5022cfcdfae05c161))
- **deps:** minimum required jest version is v27 ([dc79b6b](https://gitlab.com/html-validate/html-validate/commit/dc79b6b310347daa5b800f9b07ef26aec7cdf68d))
- **deps:** minimum required node version is v16 ([f6ccdb0](https://gitlab.com/html-validate/html-validate/commit/f6ccdb0b20494e5f651b6f711f2a86daeb4f8168))
- **rules:** remove deprecated `void` rule ([3e727d8](https://gitlab.com/html-validate/html-validate/commit/3e727d8878af8977689a6586d0456ad269cd09f4))

### Bug Fixes

- **config:** remove deprecated severity alias `disabled` ([6282293](https://gitlab.com/html-validate/html-validate/commit/628229386537accff7f7f2fdc4209e7473c4680f))

## 7.18.1 (2023-06-04)

### Bug Fixes

- **cli:** error message on missing --config file ([e948a18](https://gitlab.com/html-validate/html-validate/commit/e948a18d2ffaa76bf2d9b08a16447dcab01c3c1e))

## 7.18.0 (2023-05-24)

### Features

- add new preset `html-validate:prettier` ([9491016](https://gitlab.com/html-validate/html-validate/commit/94910166b88b4221317222e8d99dfdc2ebbc91a4)), closes [#215](https://gitlab.com/html-validate/html-validate/issues/215)

### Bug Fixes

- **api:** mark `Config.fromFile()` as internal ([3e70028](https://gitlab.com/html-validate/html-validate/commit/3e700285aae95da02b13a76ac018151df607c464))
- **api:** mark `Config.getMetaTable()` as internal ([8cb6dd0](https://gitlab.com/html-validate/html-validate/commit/8cb6dd080b32fb45d71d01a801777800b14316dd))
- **api:** mark `dumpEvents`,`dumpSource`, `dumpTokens` and `dumpTree` as internal ([866f219](https://gitlab.com/html-validate/html-validate/commit/866f219c63e3b1f40f7f3c867915b8184d015bd1))
- **jest:** `toMatchCodeframe` and `toMatchInlineCodeframe` handles async result ([584c67e](https://gitlab.com/html-validate/html-validate/commit/584c67ed443182afa1444123affb0ce7630e5efd))

## 7.17.0 (2023-05-12)

### Features

- allow to specify plugins inline in configuration ([6ba1467](https://gitlab.com/html-validate/html-validate/commit/6ba1467dcbcfb48cae6931792178e8038cc26d38))

### Bug Fixes

- **rules:** allow custom elements to use `aria-label` ([513a813](https://gitlab.com/html-validate/html-validate/commit/513a81335ba08104940cdc5611f6c3e393d95dab))

## 7.16.0 (2023-05-04)

### Features

- **api:** `ConfigLoader` returns a `ResolvedConfig` ([1fd8b73](https://gitlab.com/html-validate/html-validate/commit/1fd8b73f9ffd3640a3814931681627d662625f58))

### Dependency upgrades

- **deps:** update dependency @html-validate/stylish to v4 ([2a089ec](https://gitlab.com/html-validate/html-validate/commit/2a089ec03e7e49bb620fb61df8dde2928274d2fa))

## 7.15.3 (2023-05-03)

### Bug Fixes

- **api:** remove unused `url` import ([a2017ff](https://gitlab.com/html-validate/html-validate/commit/a2017ff374c8b078426f7554478ec8c49766c235))

## 7.15.2 (2023-05-03)

### Bug Fixes

- **api:** fix typescript not finding type declarations ([0950bb9](https://gitlab.com/html-validate/html-validate/commit/0950bb979134c9e43e6f1988905d6542dac37757)), closes [#217](https://gitlab.com/html-validate/html-validate/issues/217)
- **rules:** `form-dup-name` defaults to allow `<button type="submit">` to share name ([b39b9ad](https://gitlab.com/html-validate/html-validate/commit/b39b9adbc5129b2288b8dc65e99a2774a695d8b7)), closes [#212](https://gitlab.com/html-validate/html-validate/issues/212)

### Dependency upgrades

- **deps:** update dependency glob to v10 ([1855cf0](https://gitlab.com/html-validate/html-validate/commit/1855cf06853e1793f4a9567c82636fb057a45894))

## 7.15.1 (2023-04-09)

### Bug Fixes

- add missing exports ([7fb141d](https://gitlab.com/html-validate/html-validate/commit/7fb141dd692384cc897c1b55e4352446ed7a30b3))
- fix `html-validate/test-utils` entrypoint ([62fbee3](https://gitlab.com/html-validate/html-validate/commit/62fbee331ce2452988f4c5e3898ce68602e0aedf))
- include tsdoc-metadata.json ([61dd7dd](https://gitlab.com/html-validate/html-validate/commit/61dd7dd4a15cb992deb1ced45787afd0ee9230a9))

## 7.15.0 (2023-04-09)

### Features

- dts rollup ([9743e9c](https://gitlab.com/html-validate/html-validate/commit/9743e9ca6f15d2ed2b0c29225e6039edf56b7645))

### Bug Fixes

- **dom:** `querySelector` typescript declaration returns null to match implementation ([9c9befe](https://gitlab.com/html-validate/html-validate/commit/9c9befe6199918c8b1a0912a7d90190d87a4296b))
- fix browser entrypoint for older bundlers ([c8320ba](https://gitlab.com/html-validate/html-validate/commit/c8320ba3e3561b44be94a3763cbdf07750c08b4c))

## 7.14.0 (2023-03-26)

### Features

- **rules:** add `[role="alertdialog"]` as a default sectioning root for `heading-level` ([b87581a](https://gitlab.com/html-validate/html-validate/commit/b87581a15cee7eac56a1de7ee43e70edbc4f305a))

### Bug Fixes

- **cli:** fix glob pattern when file extension list is empty ([d95a418](https://gitlab.com/html-validate/html-validate/commit/d95a418ff5ecb0767ad74e39748df8e31abb2dce))

### Dependency upgrades

- **deps:** update dependency glob to v9 ([effd3bc](https://gitlab.com/html-validate/html-validate/commit/effd3bc3e20db9890491af80cd9ad333bc16a835))

## 7.13.3 (2023-03-10)

### Bug Fixes

- **rules:** check for empty alt tag in `wcag/h37` ([5f3b43f](https://gitlab.com/html-validate/html-validate/commit/5f3b43fb67539ee1945513137346335bc1f8ae91)), closes [#209](https://gitlab.com/html-validate/html-validate/issues/209)

## 7.13.2 (2023-02-08)

### Bug Fixes

- add button and reset types to form-dup-name shared options ([d6ef9f8](https://gitlab.com/html-validate/html-validate/commit/d6ef9f879675891772f1ab932b7d64bc7cbd60de))

## 7.13.1 (2023-01-15)

### Bug Fixes

- `no-unused-disable` properly reports location when more than two rules are disabled ([26d1970](https://gitlab.com/html-validate/html-validate/commit/26d1970305991e8095d132a9c06c3db163daf2c4))
- allow `no-unused-disable` to be disabled by directive ([b11166c](https://gitlab.com/html-validate/html-validate/commit/b11166c4b2e9ae7f5165c9f4a8cb93bd8baddb0a))

## 7.13.0 (2023-01-15)

### Features

- expose `Validator` helper ([6ef10dd](https://gitlab.com/html-validate/html-validate/commit/6ef10dd2f865b7cd45d56029e54f2eaece58d801)), closes [#204](https://gitlab.com/html-validate/html-validate/issues/204)
- report unused disable directives ([5a2731f](https://gitlab.com/html-validate/html-validate/commit/5a2731f34e0e96260f6664ac5b5823f4a4b4716b)), closes [#196](https://gitlab.com/html-validate/html-validate/issues/196)

## 7.12.2 (2023-01-09)

### Bug Fixes

- `form-dup-name` validate checkboxes by default ([d5e7b7d](https://gitlab.com/html-validate/html-validate/commit/d5e7b7d1a2094a3cb16b85de44f8ad129bd84a87)), closes [#202](https://gitlab.com/html-validate/html-validate/issues/202)
- add `allowArrayBrackets` option to `form-dup-name` rule ([a43ea0b](https://gitlab.com/html-validate/html-validate/commit/a43ea0b3de88dc0c54c8e0ef368e162c3d43f2ff)), closes [#203](https://gitlab.com/html-validate/html-validate/issues/203)
- add `shared` option to `form-dup-name` to set which controls allow shared names ([7ddc02b](https://gitlab.com/html-validate/html-validate/commit/7ddc02b71e093923b7ae1e637b1c061cf73e308a)), closes [#201](https://gitlab.com/html-validate/html-validate/issues/201)

## 7.12.1 (2023-01-05)

### Bug Fixes

- **rules:** `form-dup-name` reports when radio and non-radio uses same name ([6d9a282](https://gitlab.com/html-validate/html-validate/commit/6d9a282e5f8d1d02c1aff0b930afc992f769955b)), closes [#200](https://gitlab.com/html-validate/html-validate/issues/200)

## 7.12.0 (2022-12-28)

### Features

- **api:** `Attribute.valueMatches` can take array of keywords to match against ([0a5ff8e](https://gitlab.com/html-validate/html-validate/commit/0a5ff8eaf09b7ae13c9e46830e49c89d031b8f49))
- **api:** add `Rule.getMetaFor(..)` ([5a76381](https://gitlab.com/html-validate/html-validate/commit/5a76381e7121efe65f2009c2f1171fa51d6c731d))
- **api:** add new `formAssociated` property when defining metadata ([3d56c4a](https://gitlab.com/html-validate/html-validate/commit/3d56c4a5b76f909f41f67e3797bfa716e2ef20e8))
- **meta:** `MetaAttributeAllowedCallback` takes the attribute as second argument ([7a4edeb](https://gitlab.com/html-validate/html-validate/commit/7a4edeb2b81d88663e353f7744e36e4deb379bb2))
- **rules:** new rule `form-dup-name` ([74f8e2d](https://gitlab.com/html-validate/html-validate/commit/74f8e2dcfe76b2efc961779fb4c835cb54a29239)), closes [#197](https://gitlab.com/html-validate/html-validate/issues/197)
- **rules:** new rule `map-id-name` ([abe5acb](https://gitlab.com/html-validate/html-validate/commit/abe5acb9ad28afaf583d34f0e2f58b2ea52cc3ae)), closes [#184](https://gitlab.com/html-validate/html-validate/issues/184)

### Bug Fixes

- **parser:** enable cache api on document root ([a1cfe64](https://gitlab.com/html-validate/html-validate/commit/a1cfe64525d8407730fca4ce5fae7d9c69393b58))

## 7.11.1 (2022-12-22)

### Bug Fixes

- allow setting metadata attribute to `null` to remove it ([7118d9b](https://gitlab.com/html-validate/html-validate/commit/7118d9b1349c44df155666c3d95b960fba8b96a7))
- better error message when element inheritance fails ([717c186](https://gitlab.com/html-validate/html-validate/commit/717c186df5a6780ccdcfb39a6c52b10d378f2a28))

## 7.11.0 (2022-12-19)

### Features

- **api:** add `keywordPatternMatcher` for usage with `include`/`exclude` options ([6bd360f](https://gitlab.com/html-validate/html-validate/commit/6bd360f941ce8c408738e98655b050f2aed76595))
- **rules:** add `include` and `exclude` support to `no-unknown-elements` ([cd7fb23](https://gitlab.com/html-validate/html-validate/commit/cd7fb238f2097dfaadfe66878eead21ac3937b75))
- validateOccurrences and element-permitted-occurences support tag category ([b37d9ac](https://gitlab.com/html-validate/html-validate/commit/b37d9ac7b504a507427cd420ecc9791c308fc386))

### Bug Fixes

- hgroup is still valid, support the current content model ([4040db3](https://gitlab.com/html-validate/html-validate/commit/4040db366f89f8dca0eebd205ff98f1620433059)), closes [#198](https://gitlab.com/html-validate/html-validate/issues/198)
- **rules:** improve error message for `wcag/h63` ([fa16f51](https://gitlab.com/html-validate/html-validate/commit/fa16f51e47b726938a12d1e59dc7ed1d8656e1c5))
- **rules:** improved error message with `element-required-content` using categories ([a71a2d8](https://gitlab.com/html-validate/html-validate/commit/a71a2d803706a0b074807c9ae1c23fbaec8ae397))

## 7.10.1 (2022-12-04)

### Bug Fixes

- allow `as` with `prefetch` ([54ceeb1](https://gitlab.com/html-validate/html-validate/commit/54ceeb1f645cae053c493dced4cb983411a5a9e5))

## 7.10.0 (2022-11-17)

### Features

- **rules:** add `wcag/h63` for header cell scopes ([ee012c6](https://gitlab.com/html-validate/html-validate/commit/ee012c6a0c92add912cb1bc1629076cdf57bab97))

### Bug Fixes

- **html5:** `<th>` does not require `scope` attribute ([44bb935](https://gitlab.com/html-validate/html-validate/commit/44bb93565b975e1f1634dbeb18ee6abf409512ab)), closes [#189](https://gitlab.com/html-validate/html-validate/issues/189)
- **rules:** `empty-heading` handles `hidden` attribute ([e33b55e](https://gitlab.com/html-validate/html-validate/commit/e33b55eaee724ebcbfa7f6d49d7de870301309c3)), closes [#193](https://gitlab.com/html-validate/html-validate/issues/193)
- **rules:** `wcag/h30` handles `hidden` attribute ([c5ac930](https://gitlab.com/html-validate/html-validate/commit/c5ac93066beb4a65a7d99770cedf26da19294f75))

## 7.9.0 (2022-11-16)

### Features

- new `definePlugin` helper ([e28c275](https://gitlab.com/html-validate/html-validate/commit/e28c275c1d9c1d556c1080521864f6475bbbdd8f))
- **rules:** new option `ignoreCase` added to `unrecognized-char-ref` ([4a1b9af](https://gitlab.com/html-validate/html-validate/commit/4a1b9af7bbdaf6fb490aa193455de4f7e1266c45))
- **rules:** new option `requireSemicolon` added to `unrecognized-char-ref` ([b7a5067](https://gitlab.com/html-validate/html-validate/commit/b7a50675e92db1dcf1adb8f375eb72e84cf19674))
- **rules:** new rule `map-dup-name` ([ad7bfff](https://gitlab.com/html-validate/html-validate/commit/ad7bfff58b3b53168e6b9507e277950242508b26)), closes [#180](https://gitlab.com/html-validate/html-validate/issues/180)

### Bug Fixes

- **rules:** add selector to `unrecognized-char-ref` errors ([73b29ef](https://gitlab.com/html-validate/html-validate/commit/73b29ef3746cca85105f050b581b24f6a37615ce))
- **rules:** include different capitalization for named character references (html entities) ([83f205a](https://gitlab.com/html-validate/html-validate/commit/83f205a42f9935e887207c3d066293cbf5355bcb)), closes [#192](https://gitlab.com/html-validate/html-validate/issues/192)

## 7.8.0 (2022-10-31)

### Features

- **html5:** bundle element metadata ([1e59f3e](https://gitlab.com/html-validate/html-validate/commit/1e59f3e2ee0703c6bc62ceede59104d15773f8ae))

### Bug Fixes

- **api:** `getFormatter` ts declaration guarantees a `Formatter` will be returned for known formatters ([14ce8b1](https://gitlab.com/html-validate/html-validate/commit/14ce8b1eae8497e6a2fcdca0ea6d1f2a36315a0d))

## 7.7.1 (2022-10-24)

### Bug Fixes

- **api:** export browser bundle as `html-validate/browser` ([dc1c322](https://gitlab.com/html-validate/html-validate/commit/dc1c3228149c3026ec8680587c101c7ff73fefcc))
- **html5:** handle `<meta property>` (RDFa such as OG) ([63e8814](https://gitlab.com/html-validate/html-validate/commit/63e881478048ef97996959e518d41003fa8f7b52)), closes [#187](https://gitlab.com/html-validate/html-validate/issues/187)

## 7.7.0 (2022-10-23)

### Features

- **html5:** validates `<a target>` and `<area target>` for valid keywords ([6fa0bd9](https://gitlab.com/html-validate/html-validate/commit/6fa0bd9b823b746eeeab1d644c8748f288ea2730))
- new `defineMetadata` helper for writing custom element metadata ([6a06811](https://gitlab.com/html-validate/html-validate/commit/6a06811bb9d527648bc738ee464cfb5834fb038f)), closes [#186](https://gitlab.com/html-validate/html-validate/issues/186)
- **rules:** new rule `area-alt` ([3c1f0b3](https://gitlab.com/html-validate/html-validate/commit/3c1f0b3a6c2b24532d8c90894e54366bc79870e3)), closes [#178](https://gitlab.com/html-validate/html-validate/issues/178)
- **rules:** new rule `attribute-misuse` ([07a0bbe](https://gitlab.com/html-validate/html-validate/commit/07a0bbe15149d588c4c03956fdb410bc1dab236a)), closes [#181](https://gitlab.com/html-validate/html-validate/issues/181)

### Bug Fixes

- **html5:** `<map>` requires `name` attribute ([6104eb3](https://gitlab.com/html-validate/html-validate/commit/6104eb3e4874bcd1c97574994728dc1b2d489a42))
- **html5:** `<meta charset>` should only allow `utf-8` ([aaa15fe](https://gitlab.com/html-validate/html-validate/commit/aaa15fefdde59e0b8285c39ffa349f35d96cdb03))
- **html5:** disallow `<area coords>` when `shape` is `default` ([76115f2](https://gitlab.com/html-validate/html-validate/commit/76115f2388d61239f7f236877f38010daeb8444d)), closes [#183](https://gitlab.com/html-validate/html-validate/issues/183)
- **html5:** mark `<keygen>` as deprecated ([859402d](https://gitlab.com/html-validate/html-validate/commit/859402d11543052180829f1b0b8b7b2914dc3917))
- **html5:** require `<area coords>` when `shape` is requires is ([ed750c1](https://gitlab.com/html-validate/html-validate/commit/ed750c1a8f8b38469cc474a8ebb046470cd2f15a)), closes [#182](https://gitlab.com/html-validate/html-validate/issues/182)

## 7.6.0 (2022-10-10)

### Features

- `input-missing-label` checks for presence of text ([4aa7d77](https://gitlab.com/html-validate/html-validate/commit/4aa7d77e21e21a21735c973c4aa5b94835b4e7d3)), closes [#170](https://gitlab.com/html-validate/html-validate/issues/170)
- **api:** add `HtmlElement.ariaLabelledby` ([8463d43](https://gitlab.com/html-validate/html-validate/commit/8463d43f58df27a53ce21e964fd36d9f4618a0ef))
- **api:** expose `classifyNodeText` helper ([97621fd](https://gitlab.com/html-validate/html-validate/commit/97621fd2dc30a72efe410df6b4b489c50718fed3))
- **api:** new rule helper `hasAccessibleText` ([b8f8330](https://gitlab.com/html-validate/html-validate/commit/b8f8330b79679a5605cc1aa02c1ada6b53f42b08))
- **rules:** `classifyNodeText` helper respects `hidden` and `aria-hidden` attributes ([8ba2c5a](https://gitlab.com/html-validate/html-validate/commit/8ba2c5af8790e33931efb477b49dfb93862e32ab))
- **rules:** `classifyNodeText` option to ignore hidden attribute on element ([41ba7f9](https://gitlab.com/html-validate/html-validate/commit/41ba7f9c4bb25bc543d66010331a0577d4c8f534))
- **rules:** `isHTMLHidden` and `isAriaHidden` can return detailed results ([fb28c2e](https://gitlab.com/html-validate/html-validate/commit/fb28c2e97248cb45b676908aa2e702c11c23a690))

### Bug Fixes

- `<select>` does no longer classify as having text content ([3fb1d15](https://gitlab.com/html-validate/html-validate/commit/3fb1d15f9dc8b39fdc8722a03b5a7454b88e0c34))
- `<textarea>` does no longer classify as having text content ([04517cf](https://gitlab.com/html-validate/html-validate/commit/04517cf65ba12b69e0bb69538fa21fe91fcbc8a3))
- **rules:** `empty-heading` satisfied by images with alt text ([ff68fbb](https://gitlab.com/html-validate/html-validate/commit/ff68fbb7fb209ccd668928e128ab3cde3f4447f7)), closes [#176](https://gitlab.com/html-validate/html-validate/issues/176)

## 7.5.0 (2022-09-19)

### Features

- support js config files when using `--config` ([929f2c8](https://gitlab.com/html-validate/html-validate/commit/929f2c8ba404d188bc183e2efe1fed06a985b344)), closes [#175](https://gitlab.com/html-validate/html-validate/issues/175)

## 7.4.1 (2022-09-11)

### Bug Fixes

- `input-missing-label` should ignore `<input type="reset">` too ([280bb5c](https://gitlab.com/html-validate/html-validate/commit/280bb5c30ec0722de9c73e58937da12f7419a62b))
- allow `<template>` as parent to `<li>` ([aa0aadc](https://gitlab.com/html-validate/html-validate/commit/aa0aadc100eae3deb7f2cf23852b6f873cce9aef))

## 7.4.0 (2022-09-11)

### Features

- **deps:** support jest v29 ([0f266ca](https://gitlab.com/html-validate/html-validate/commit/0f266ca2489fcaa79516984ae451608f5cfb7ccd))
- **rules:** new rule `element-permitted-parent` ([cdcc117](https://gitlab.com/html-validate/html-validate/commit/cdcc117b4c8a730be160d68880e64983494edc7a))

### Bug Fixes

- **html5:** `<meta itemprop>` can be used where flow or phrasing is expected ([0c6c74c](https://gitlab.com/html-validate/html-validate/commit/0c6c74cd82840c1ca8983bdb01685262460b7632)), closes [#168](https://gitlab.com/html-validate/html-validate/issues/168)
- rename preset `html-validate:a17y` to `html-validate:a11y` (typo fix) ([0440fcd](https://gitlab.com/html-validate/html-validate/commit/0440fcdde3146d41f5b847c0b6b489c549d0ee7e)), closes [#171](https://gitlab.com/html-validate/html-validate/issues/171)
- **rules:** `input-missing-label` now ignores input type `submit` and `button` ([39317da](https://gitlab.com/html-validate/html-validate/commit/39317daec0b1ef1b8f8102d62852fc4deedfe1f2)), closes [#170](https://gitlab.com/html-validate/html-validate/issues/170)
- **rules:** improve error message when alt is empty ([8f50e8f](https://gitlab.com/html-validate/html-validate/commit/8f50e8f1bf498b339276e687f6d29fdd078a51d5))
- **rules:** verify presence of alt attribute on `<input type="image">` ([feeb56e](https://gitlab.com/html-validate/html-validate/commit/feeb56ea0443f9349f7f83427373ded2825e7811))

## 7.3.3 (2022-08-25)

### Bug Fixes

- `<form>` action attribute false positives ([f93a8fc](https://gitlab.com/html-validate/html-validate/commit/f93a8fc3a5a8423d15f14a1a5c8c839aab6fe726)), closes [#167](https://gitlab.com/html-validate/html-validate/issues/167)
- **cli:** fix typo in maximum warnings message ([8971323](https://gitlab.com/html-validate/html-validate/commit/8971323e23a6107e08729ba40e22b6a58ef1a1c8))

## 7.3.2 (2022-08-24)

### Bug Fixes

- better error message when failing to parse html-validate directive ([0e9d98e](https://gitlab.com/html-validate/html-validate/commit/0e9d98e4e0835bf0bd568dbbf306084fae800328)), closes [#166](https://gitlab.com/html-validate/html-validate/issues/166)

## 7.3.1 (2022-08-21)

### Bug Fixes

- handle quoted `.`, `#`, `:` and`[` in attribute selectors ([7282625](https://gitlab.com/html-validate/html-validate/commit/7282625e2b663afdb671c38bcaccd0bdc7d74b9e)), closes [#162](https://gitlab.com/html-validate/html-validate/issues/162) [#147](https://gitlab.com/html-validate/html-validate/issues/147)
- **html5:** disallow empty `action` attribute on `<form>` ([0cdb7b2](https://gitlab.com/html-validate/html-validate/commit/0cdb7b27c89d259e7c4ad0c39208588d221533e2)), closes [#165](https://gitlab.com/html-validate/html-validate/issues/165)

## 7.3.0 (2022-08-11)

### Features

- allow `method="dialog"` on `<form>` element ([997f999](https://gitlab.com/html-validate/html-validate/commit/997f999a9a0bf45bbc3c264dd3523ef245772998)), closes [#161](https://gitlab.com/html-validate/html-validate/issues/161)

## 7.2.0 (2022-08-04)

### Features

- **html5:** add `<dialog>` element ([243bf56](https://gitlab.com/html-validate/html-validate/commit/243bf5676a04aa2eedc8166e7b384c3c92fd79b6)), closes [#160](https://gitlab.com/html-validate/html-validate/issues/160)
- **rules:** `element-permitted-content` lists all required ancestors ([be34e01](https://gitlab.com/html-validate/html-validate/commit/be34e01db158c9cb534bda6b63b3c68c88b8fab8))
- **rules:** `element-permitted-content` verifies root element ([6eb721f](https://gitlab.com/html-validate/html-validate/commit/6eb721f749d5095971f19986fd8a6e2427d4ae3f))
- **rules:** split ancestor validation from `element-permitted-content` to new rule `element-required-ancestors` ([dcb2096](https://gitlab.com/html-validate/html-validate/commit/dcb2096ca4ceca914eebe5d63f6f02500a8b39d0))

### Bug Fixes

- **api:** allow passing object when reporting errors ([f8500be](https://gitlab.com/html-validate/html-validate/commit/f8500beb7fdbb9c2e1065cb06f59d60aec18fa0a))
- **api:** hide internal properties when using `--dump-events` ([206294f](https://gitlab.com/html-validate/html-validate/commit/206294fb4d4694ca69021b87abf1ff63651c54c1))
- **html5:** `<body>` should only accept flow content ([1b08c66](https://gitlab.com/html-validate/html-validate/commit/1b08c668aa8756e95753d3dd18c67929e239078f))
- **html5:** `<li>` requires `<ul>`, `<ol>` or `<menu>` parent ([b88384e](https://gitlab.com/html-validate/html-validate/commit/b88384e940fdf1b75a11bb2c4b77619659a2a907))
- **rules:** `element-permitted-content` documentation fixes ([613dd48](https://gitlab.com/html-validate/html-validate/commit/613dd48882160f7c65628e91fc547dd1fbe72c2c))

## 7.1.2 (2022-07-05)

### Bug Fixes

- add missing metadata for SVG `<title>` and `<desc>` elements ([78ec55f](https://gitlab.com/html-validate/html-validate/commit/78ec55f454b863715383df4042a08dbd5aafce66)), closes [#157](https://gitlab.com/html-validate/html-validate/issues/157)
- escape additional characters in CSS selectors ([774ba95](https://gitlab.com/html-validate/html-validate/commit/774ba95cafd8e2df471fd15e78ddb7487bf497f1)), closes [#158](https://gitlab.com/html-validate/html-validate/issues/158)

### 7.1.1 (2022-05-22)

### Bug Fixes

- **rules:** match attribute enum values case insensitive ([36a8ed9](https://gitlab.com/html-validate/html-validate/commit/36a8ed91ccc0767facdb3ec6492e29892688f0ca)), closes [#154](https://gitlab.com/html-validate/html-validate/issues/154)

### Dependency upgrades

- **deps:** update dependency @html-validate/stylish to v3 ([23549e3](https://gitlab.com/html-validate/html-validate/commit/23549e3ee744c869f02a2101ac00b114f2495ff3))

## 7.1.0 (2022-05-15)

### Features

- **rules:** add `any` option to `attr-quotes` ([cedf9d5](https://gitlab.com/html-validate/html-validate/commit/cedf9d523ab100fb6312559da3defd8114cdff3d)), closes [#152](https://gitlab.com/html-validate/html-validate/issues/152)
- **rules:** add `include`/`exclude` options to `require-sri` rule ([93931c5](https://gitlab.com/html-validate/html-validate/commit/93931c5223dee30c4058fb023847692dbda2f291)), closes [#153](https://gitlab.com/html-validate/html-validate/issues/153)
- **rules:** new rule `require-csp-nonce` ([d534a32](https://gitlab.com/html-validate/html-validate/commit/d534a327fd40013800225aba5400b477b2e443e5))

### Dependency upgrades

- **deps:** update dependency @sidvind/better-ajv-errors to v2 ([bd27e3c](https://gitlab.com/html-validate/html-validate/commit/bd27e3c270519e36e21c64cce52bfe58dab2bea3))

## 7.0.0 (2022-05-06)

### ⚠ BREAKING CHANGES

See {@link migration migration guide} for details.

- require node 14

### Features

- require node 14 ([e294b5e](https://gitlab.com/html-validate/html-validate/commit/e294b5e7e64ecf00bfe007635dd06cd4a100fff7))

### 6.11.1 (2022-05-06)

### Bug Fixes

- add type declaration for `html5.js` ([4647dee](https://gitlab.com/html-validate/html-validate/commit/4647dee3dbac0ddedb80747047b0b033ce61513a))
- expose `MetaDataTable` type ([79f30d0](https://gitlab.com/html-validate/html-validate/commit/79f30d00aa73139fbca0e44160197c5b6db6e95f))
- fix loading `jest.js` and `test-utils.js` ([84877df](https://gitlab.com/html-validate/html-validate/commit/84877dfb8db2b7cb8143640df8dba7f4d71cd6c3))

## 6.11.0 (2022-05-05)

### Features

- **deps:** support jest 28 ([458e460](https://gitlab.com/html-validate/html-validate/commit/458e4608b76c20a9dc5315be84f294735bd19fca))

### Bug Fixes

- handle windows `\\` when expanding directories ([dfe3dbf](https://gitlab.com/html-validate/html-validate/commit/dfe3dbfa0080eba2ae111ba43a763d2de657d398))

## 6.10.0 (2022-05-04)

### Features

- **jest:** add `.toMatchCodeframe()` as complement to `.toMatchInlineCodeframe()` ([23473e4](https://gitlab.com/html-validate/html-validate/commit/23473e42a20fb28de7032a944b5bf4b6bf65948f))
- **jest:** support passing string to `toMatch{,Inline}Codeframe()` ([1864e43](https://gitlab.com/html-validate/html-validate/commit/1864e4330f0284371b9b80ad58f37830b9f718df))

### Bug Fixes

- **jest:** extend recommended config when using `toHTMLValidate()` ([5c890ea](https://gitlab.com/html-validate/html-validate/commit/5c890eab57041a93ee6b407e1ab3d58762b02f4b))

### Performance Improvements

- improve performance by caching json schema ([6be5c3a](https://gitlab.com/html-validate/html-validate/commit/6be5c3a40e68f6a92fad9927973b2dffdb28ec20))

### 6.9.1 (2022-04-29)

### Bug Fixes

- include `<menu>` in builtin HTML5 elements ([28d7a2b](https://gitlab.com/html-validate/html-validate/commit/28d7a2b10369ac814d17cb5ed3d3731799792f92)), closes [#151](https://gitlab.com/html-validate/html-validate/issues/151)

## 6.9.0 (2022-04-27)

### Features

- new rule `valid-id` ([706000b](https://gitlab.com/html-validate/html-validate/commit/706000ba664cf71d291742fc95cd401206465370))

### Bug Fixes

- generate valid selector when `id` is numeric ([4d6711e](https://gitlab.com/html-validate/html-validate/commit/4d6711e22d9549066fb9d15a8bc8b100e58c7267)), closes [#149](https://gitlab.com/html-validate/html-validate/issues/149)

## 6.8.0 (2022-04-24)

### Features

- `tel-non-breaking` checks for presence of `white-space: nowrap` ([6d1b968](https://gitlab.com/html-validate/html-validate/commit/6d1b96807590c98d980a695d7025b251f5765373))
- deferred generation of selectors for error messages for more accurate results ([ac98c6e](https://gitlab.com/html-validate/html-validate/commit/ac98c6e690d101ca1960006ec90547dbe6d8eee7))
- implement `style` property on `HtmlElement` ([f6f8ad2](https://gitlab.com/html-validate/html-validate/commit/f6f8ad25cdd3950695f702f0982992d5b67a1212))
- **jest:** add new `toMatchInlineCodeframe` matcher ([dc0eab4](https://gitlab.com/html-validate/html-validate/commit/dc0eab42b5aa12cfe7658d80238d0ab8c78faad3))
- **jest:** remove internal `toBeToken` matcher from public consumption ([15f7e1c](https://gitlab.com/html-validate/html-validate/commit/15f7e1c227ebc02ed0ca1728339dd27ee64d8735))
- migrate `html5.json` to `html5.js` ([6316b98](https://gitlab.com/html-validate/html-validate/commit/6316b98394a094940d77e33c251b64d3d0c50ef5))
- require jest 25.1 or later ([f4fad37](https://gitlab.com/html-validate/html-validate/commit/f4fad3798976b15d762a548ee4e5c8cd6082fd26))

### Dependency upgrades

- **deps:** update dependency glob to v8 ([ccb6dd4](https://gitlab.com/html-validate/html-validate/commit/ccb6dd4af97489fffe19c64ffa8c1f900687e649))

### 6.7.1 (2022-04-08)

### Bug Fixes

- **rules:** fix reported selector for `tel-non-breaking` errors ([0909ce4](https://gitlab.com/html-validate/html-validate/commit/0909ce440f6c84108babe7fd80b43695d47d36f2))
- **rules:** show character description in `tel-non-breaking` ([894d456](https://gitlab.com/html-validate/html-validate/commit/894d456fda5c5e04075da16813c2f88f3d6149f4))

## 6.7.0 (2022-04-08)

### Features

- **jest:** allow passing object to `toHaveError(..)` ([bc098f5](https://gitlab.com/html-validate/html-validate/commit/bc098f517cc0f6e2849e8e1b71f1b5361aea8d71))
- **rules:** new rule `tel-non-breaking` ([32a6fe2](https://gitlab.com/html-validate/html-validate/commit/32a6fe264ca31cbf67dc2277d63f5012fd95b4e8))

### Bug Fixes

- **cli:** proper argument count to `--print-config` ([91c1a45](https://gitlab.com/html-validate/html-validate/commit/91c1a455a150f61e5e061109332f6c171bad942e))
- remove unnecessary fields from published package.json ([06528c7](https://gitlab.com/html-validate/html-validate/commit/06528c743cfada2f8fcd0eb593485e9302f88690))
- **rules:** better error message for `attr-delimiter` ([acf4249](https://gitlab.com/html-validate/html-validate/commit/acf424908d0e556e75a2cab49b1dee18549a81e1))

### 6.6.1 (2022-03-25)

### Bug Fixes

- **api:** typescript declaration for `ProcessElementContext` updated ([e843b8c](https://gitlab.com/html-validate/html-validate/commit/e843b8cecd836d2584f4c2853b44a83c631d9eae))

## 6.6.0 (2022-03-20)

### Features

- **parser:** parse SVG `<title>` and `<desc>` elements ([51025e1](https://gitlab.com/html-validate/html-validate/commit/51025e1d7a0256d150f7b38e99b8c3954df1df4e)), closes [#43](https://gitlab.com/html-validate/html-validate/issues/43) [#146](https://gitlab.com/html-validate/html-validate/issues/146)

### Bug Fixes

- **cli:** report error when mode flags are missing filename ([7e87cd4](https://gitlab.com/html-validate/html-validate/commit/7e87cd4e432df1f98459a8cd356b9790048afb0a)), closes [#144](https://gitlab.com/html-validate/html-validate/issues/144)
- disable `svg-focusable` by default ([d15a503](https://gitlab.com/html-validate/html-validate/commit/d15a50356df8c8250e2ebeda48a816fe5cda99d0))

## 6.5.0 (2022-02-27)

### Features

- **rules:** support message interpolation ([9356809](https://gitlab.com/html-validate/html-validate/commit/935680968bd855f3e11a35b5785bf4dcd58289f7))
- support `--` as delimiter for comments ([7c90250](https://gitlab.com/html-validate/html-validate/commit/7c90250c0dfd6f88780401d399fb375ff349022a)), closes [#143](https://gitlab.com/html-validate/html-validate/issues/143)
- throw error when directive is missing end bracket ([4cba14b](https://gitlab.com/html-validate/html-validate/commit/4cba14b098bcf5ce719107cce0973855414413ad))

### Bug Fixes

- **dom:** proper location when using `DOMTokenList` with multiple whitespace ([7b2d62c](https://gitlab.com/html-validate/html-validate/commit/7b2d62c097c80eb6519a0989355a140d59f9aec5))

## 6.4.0 (2022-02-18)

### Features

- **dom:** add typeguards to attribute API ([f831223](https://gitlab.com/html-validate/html-validate/commit/f831223cbc169919f717ad94ce81c17b430c0208))
- **event:** add parent element to `conditional` event ([b248e3b](https://gitlab.com/html-validate/html-validate/commit/b248e3b6f791ddee47661c2f57fa0fabb85027c2))

### Bug Fixes

- **rules:** add selector to `no-conditional-comment` ([6391ebf](https://gitlab.com/html-validate/html-validate/commit/6391ebf9b4692b70da81760e0231d45c7da6c7e1)), closes [#142](https://gitlab.com/html-validate/html-validate/issues/142)

### 6.3.2 (2022-02-16)

### Bug Fixes

- handle reading stdin (`/dev/stdin`) on Windows ([dcf65d1](https://gitlab.com/html-validate/html-validate/commit/dcf65d167ebd44fcfdfee59fe0b9d2461eea1b4c)), closes [#141](https://gitlab.com/html-validate/html-validate/issues/141)
- replace `\\` in urls generated on Windows ([950b3cf](https://gitlab.com/html-validate/html-validate/commit/950b3cfc53a01906ba9bd437072e17eb44da3af5)), closes [#140](https://gitlab.com/html-validate/html-validate/issues/140)

### 6.3.1 (2022-02-03)

### Dependency upgrades

- **deps:** update dependency @sidvind/better-ajv-error to v1.1.1 ([8aa3438](https://gitlab.com/html-validate/html-validate/commit/8aa34383640b838ffad2824c71beb2d077b1abbc))

## 6.3.0 (2022-02-03)

### Features

- new rule `aria-hidden-body` ([4f3b04f](https://gitlab.com/html-validate/html-validate/commit/4f3b04f83d9c85874b0e6931d0e8d0a736ff501d))

### Bug Fixes

- global element metadata is returned for unknown elements ([831f227](https://gitlab.com/html-validate/html-validate/commit/831f227aff2e277f7be27a6ced205ad3cae5c7ce))
- **rules:** improve error message for `element-required-content` ([b29d908](https://gitlab.com/html-validate/html-validate/commit/b29d9089d7b15ab6a0f81f92eb0f1b471c6b59f9))
- **rules:** improve error message for `empty-title` ([0a62b1a](https://gitlab.com/html-validate/html-validate/commit/0a62b1aad058f169539a4bb7828be8af203eea8e))

### Dependency upgrades

- **deps:** update dependency @sidvind/better-ajv-error to v1.1.0 ([f785448](https://gitlab.com/html-validate/html-validate/commit/f785448f05d3ec9d5dec8d1bd3c8c3be1902f528))

## 6.2.0 (2022-01-17)

### Features

- expose `isTextNode()` ([502ef09](https://gitlab.com/html-validate/html-validate/commit/502ef09a820550ef66d12c2a3ccb1044ccc6c0b9))

### Bug Fixes

- **rules:** improve error message for `attribute-allowed-values` ([b3d4d11](https://gitlab.com/html-validate/html-validate/commit/b3d4d119614c6804a782242fd6dd5717306cd0a3))

### 6.1.6 (2022-01-07)

### Bug Fixes

- **meta:** disallow unknown element properties ([aca70fc](https://gitlab.com/html-validate/html-validate/commit/aca70fcff5848d91ab4c0c3194bcc44ffc0d2b5d))

### Dependency upgrades

- **deps:** drop json-merge-patch dependency ([5306b2d](https://gitlab.com/html-validate/html-validate/commit/5306b2d6314669e353f0500f3a5b6e6f395ca3cf))

### 6.1.5 (2021-12-28)

### Bug Fixes

- **config:** dont process extends multiple times ([f014311](https://gitlab.com/html-validate/html-validate/commit/f01431147a74272142dd6ddcfe5d53bf68c80aa9))
- **config:** elements from extended configs should be loaded first not last ([d19519e](https://gitlab.com/html-validate/html-validate/commit/d19519e5ee97e7b5c375bca80f01dcbaa5eb0373))

### 6.1.4 (2021-12-04)

### Bug Fixes

- handle multiline `srcset` attribute ([0bb92a7](https://gitlab.com/html-validate/html-validate/commit/0bb92a7c649d44281f530ea105aba55c9f3191ff)), closes [#138](https://gitlab.com/html-validate/html-validate/issues/138)

### 6.1.3 (2021-11-19)

### Bug Fixes

- parse `<style>` content as text instead of markup ([0ab61e6](https://gitlab.com/html-validate/html-validate/commit/0ab61e6f9c875f76d0b7725f615808eedf1531fd)), closes [#137](https://gitlab.com/html-validate/html-validate/issues/137)
- **rules:** handle malformed `style` attribute in `no-inline-style` rule ([7e12d50](https://gitlab.com/html-validate/html-validate/commit/7e12d507785eaf4fbbacf9b6ad53c31d5c6aece0))

### 6.1.2 (2021-11-13)

### Bug Fixes

- fix .d.ts paths in package ([f24c2f4](https://gitlab.com/html-validate/html-validate/commit/f24c2f4752680edc6624d173599032cc5ed9830b))

### 6.1.1 (2021-11-10)

### Dependency upgrades

- **deps:** update dependency @sidvind/better-ajv-errors to v1 ([373b608](https://gitlab.com/html-validate/html-validate/commit/373b6086871bbcbb7df9c034ed73a513f9a97c8e))

## 6.1.0 (2021-10-02)

### Features

- **rules:** `allowed-links` support `include` and `exclude` ([a3f7b6a](https://gitlab.com/html-validate/html-validate/commit/a3f7b6aa2414ab41239ec1aed6d463502575bb13))

### Bug Fixes

- handle multiline templating strings ([cddf7d5](https://gitlab.com/html-validate/html-validate/commit/cddf7d5e66ad3ce3f49b32b5dea873b04f9b6f7d)), closes [#134](https://gitlab.com/html-validate/html-validate/issues/134)

### 6.0.2 (2021-09-27)

### Bug Fixes

- **jest:** jest matcher should use FileSystemConfigLoader ([4d04bdc](https://gitlab.com/html-validate/html-validate/commit/4d04bdcdec2380cf6bc54bba8efd6f92d3c8d7bc))

### 6.0.1 (2021-09-27)

### Bug Fixes

- docs ([4973ee4](https://gitlab.com/html-validate/html-validate/commit/4973ee4f9e2e5270654a5295f5e252121358e289))

## 6.0.0 (2021-09-26)

### ⚠ BREAKING CHANGES

See {@link migration migration guide} for details.

- **htmlvalidate:** This change only affects API users, the CLI tool continues to
  work as before.

The default configuration loader has changed from `FileSystemConfigLoader` to
`StaticConfigLoader`, i.e. the directory traversal looking for
`.htmlvalidate.json` configuration files must now be explicitly enabled.

- **event:** `ConfigReadyEvent` passes `ResolvedConfig` instance instead of `ConfigData`
- **meta:** `MetaElement.attribute` has changed from `string[]` to
  `MetaAttribute[]` and both `requiredAttributes` and `deprecatedAttributes` has
  been merged into object. This only affects API usage, primarily custom rules
  accessing attribute metadata.See `MIGRATION.md` for details.

The old format is deprecated but is internally converted as to not break user
configuration. For compatibility it will probably be around for quite a while
but users should try to migrate as soon as possible.

### Features

- bump required node version to 12.22 ([80f3399](https://gitlab.com/html-validate/html-validate/commit/80f3399a3f863a81fcb505a4d0763bb8cffbbdeb))
- **elements:** migrate bundled html5 element metadata to new attribute syntax ([6132b82](https://gitlab.com/html-validate/html-validate/commit/6132b829e085689bd4d07aaf072e100609a950bd))
- **event:** `ConfigReadyEvent` passes `ResolvedConfig` instance instead of `ConfigData` ([5808a6b](https://gitlab.com/html-validate/html-validate/commit/5808a6b5ad3473f39b850778c1ae46d147abf1f6))
- **htmlvalidate:** use `StaticConfigLoader` by default ([bb94341](https://gitlab.com/html-validate/html-validate/commit/bb94341e411a40745d36362be37e0984420c6771))
- **meta:** add new list property to `MetaAttribute` ([4c1e3c9](https://gitlab.com/html-validate/html-validate/commit/4c1e3c97e741710e30765f9b3519b586462a2b87))
- **meta:** extend element attribute metadata ([6506aa6](https://gitlab.com/html-validate/html-validate/commit/6506aa6f109a5cb614d6e2817e4d26322758096b)), closes [#71](https://gitlab.com/html-validate/html-validate/issues/71)

### Dependency upgrades

- **deps:** update dependency espree to v9 ([3e0ea96](https://gitlab.com/html-validate/html-validate/commit/3e0ea96a4f8fd76db7a1113ff6ca8ea29edd62d9))

### 4.14.1 (2021-09-18)

### Bug Fixes

- **jest:** handle when `jest-diff` default import is object ([74f9b84](https://gitlab.com/html-validate/html-validate/commit/74f9b8424e0bf5071823e82bfc79d8904025808a))

## 5.5.0 (2021-09-05)

### Features

- **dom:** add iterator to `DOMTokenList` ([7bef736](https://gitlab.com/html-validate/html-validate/commit/7bef736bd9902388299e550618192d8465e5f3cc))
- **rules:** `no-missing-references` handles more aria attributes ([2843680](https://gitlab.com/html-validate/html-validate/commit/2843680da32fbe7c95f91c72d2d7607a381d5992))
- **rules:** add `minInitialRank` option to `heading-level` ([7f58572](https://gitlab.com/html-validate/html-validate/commit/7f585721fcb8e744863584cbe6e21130ade198eb)), closes [#132](https://gitlab.com/html-validate/html-validate/issues/132)

### Bug Fixes

- **jest:** synchronous matchers as long as the passed value is synchronous ([0ede9f7](https://gitlab.com/html-validate/html-validate/commit/0ede9f74f073b3d01fafff455cc3674fa1898b40))
- **rules:** `no-missing-references` handles attributes with reference lists ([2afcd86](https://gitlab.com/html-validate/html-validate/commit/2afcd86c1ead8eec42819310bae9990e45122b0e)), closes [#133](https://gitlab.com/html-validate/html-validate/issues/133)

### 5.4.1 (2021-08-29)

### Bug Fixes

- **meta:** use global meta as base when merging ([9fe3793](https://gitlab.com/html-validate/html-validate/commit/9fe3793b17bd6deb894e5d479ab11a51935829a1)), closes [#60](https://gitlab.com/html-validate/html-validate/issues/60)

## 5.4.0 (2021-08-27)

### Features

- **cli:** expand relative paths to absolute paths ([bdc3019](https://gitlab.com/html-validate/html-validate/commit/bdc30197be25c031999e156fd7dcb4f456fc7f0e)), closes [#131](https://gitlab.com/html-validate/html-validate/issues/131)

### Bug Fixes

- **cli:** handle absolute paths as input filenames ([c860af6](https://gitlab.com/html-validate/html-validate/commit/c860af66d02bf46e24a11756d5611b4c9b449ccb)), closes [#131](https://gitlab.com/html-validate/html-validate/issues/131)

## 5.3.0 (2021-08-23)

### Features

- jest matchers support async results ([ef7331f](https://gitlab.com/html-validate/html-validate/commit/ef7331f28c90fc7623b1124ed60e02e6c6018e28))

### Bug Fixes

- **jest:** handle when `jest-diff` default import is object ([7413db9](https://gitlab.com/html-validate/html-validate/commit/7413db9d2b02dde00ba1b32fb58ec6e47e7cc951))

### 5.2.1 (2021-08-09)

### Bug Fixes

- **html5:** add `user` and `environment` to `capture` attribute ([d6b8f90](https://gitlab.com/html-validate/html-validate/commit/d6b8f9062d7ecbe8148c5ae2f801a09411b57213)), closes [#130](https://gitlab.com/html-validate/html-validate/issues/130)

## 5.2.0 (2021-07-23)

### Features

- support specifying a custom loader when using library ([0e509a3](https://gitlab.com/html-validate/html-validate/commit/0e509a3d7b8931acfc2bb2452ff81ecb0877aaa8))
- **config:** add `StaticConfigData` for simple static config ([ae40706](https://gitlab.com/html-validate/html-validate/commit/ae40706f6ab545b23ae8ceb008122d23264423b9))

### Bug Fixes

- **elements:** disallow whitespace in `id` ([df2906b](https://gitlab.com/html-validate/html-validate/commit/df2906bd2a19fcc7c7a6c020af5b3550cbcc5158))
- **meta:** regex matching attribute allowed values matches entire string ([ffa0d12](https://gitlab.com/html-validate/html-validate/commit/ffa0d122d9941128de4ebd433a1508854ac6b9b8))
- **rules:** handle id with whitespace in `no-redundant-for` ([a79f266](https://gitlab.com/html-validate/html-validate/commit/a79f2669c88a135bab987ea5c64ddd6f47fd3736)), closes [#128](https://gitlab.com/html-validate/html-validate/issues/128)

### 5.1.1 (2021-07-11)

### Bug Fixes

- broken typescript declaration in previous release ([ad9cf68](https://gitlab.com/html-validate/html-validate/commit/ad9cf6832ac1b02bab282445d7e8b294c9ce524e)), closes [#127](https://gitlab.com/html-validate/html-validate/issues/127)

## 5.1.0 (2021-07-11)

### Features

- **lexer:** add attribute key-value delimiter to attribute value token ([0979798](https://gitlab.com/html-validate/html-validate/commit/0979798ac191af4a26667a282e3e554fee4450ac))
- **rules:** new rule `attr-delimiter` ([eb98461](https://gitlab.com/html-validate/html-validate/commit/eb9846155dbc42f860c31301373332624d35a3bd)), closes [#126](https://gitlab.com/html-validate/html-validate/issues/126)
- support .cjs configuration files ([cd458e3](https://gitlab.com/html-validate/html-validate/commit/cd458e3e16826700b93860507222d5af792204ef))

### Bug Fixes

- automatically find external dependencies ([62af8c5](https://gitlab.com/html-validate/html-validate/commit/62af8c5c97bdce0303ea8c5e00050014a959b08a))
- es build ([6b1cec5](https://gitlab.com/html-validate/html-validate/commit/6b1cec5b3321ddd8094483a50ce1cd686356142f))
- import semver correctly ([4ed8eac](https://gitlab.com/html-validate/html-validate/commit/4ed8eac2609dfd5411180bb6166ab8a8783dc53b))
- make prefer-button tag and attribute checks case-insensitive ([95e7748](https://gitlab.com/html-validate/html-validate/commit/95e774863a3df2197fb2cf7879e0e8cd83c3c4bd))
- only check value of type attribute in prefer-button rule ([2e46586](https://gitlab.com/html-validate/html-validate/commit/2e46586b5d69be6847128e58271d382cb7f46e90))

### 5.0.2 (2021-06-28)

### Bug Fixes

- handle leading and trailing whitespace in `style` attributes ([a71b947](https://gitlab.com/html-validate/html-validate/commit/a71b94747eda26e8e50ff28b1a0269646ee09818)), closes [#122](https://gitlab.com/html-validate/html-validate/issues/122)

### 5.0.1 (2021-06-27)

### Bug Fixes

- custom log callback for `compatibilityCheck` ([cbd2226](https://gitlab.com/html-validate/html-validate/commit/cbd22269ce2a5debb87c785b9db8740d4874ab4e))

### Dependency upgrades

- **deps:** update dependency @html-validate/stylish to v2 ([ab0b1f9](https://gitlab.com/html-validate/html-validate/commit/ab0b1f9d394c7b97350e6c1826fc8ee94d065015))

## 5.0.0 (2021-06-27)

### ⚠ BREAKING CHANGES

- the library is now shipped as a hybrid CJS/ESM package. If you
  are simply consuming the CLI tool or one of the existing integrations this will
  not affect you.

For plugin developers and if you consume the API in any way the biggest change
is that the distributed source is now bundled and you can no longer access
individual files.

Typically something like:

```diff
-import foo from "html-validate/dist/foo";
+import { foo } from "html-validate"
```

Feel free to open an issue if some symbol you need isn't exported.

If your usage includes checking presence of rules use the `ruleExists` helper:

```diff
-try {
-  require("html-validate/dist/rules/attr-case");
-} catch (err) {
-  /* fallback */
-}
+import { ruleExists } from "html-validate";
+if (!ruleExists("attr-case")) {
+  /* fallback */
+}
```

- drop support for NodeJS 10

### Features

- add `compatibilityCheck` helper for plugins ([4758595](https://gitlab.com/html-validate/html-validate/commit/47585951e7faf026bccc228d537f678d69da1c8a))
- cjs/esm hybrid package ([39c960a](https://gitlab.com/html-validate/html-validate/commit/39c960a19f47cedcb55edf0865a3e6bd174a61f6)), closes [#112](https://gitlab.com/html-validate/html-validate/issues/112)
- drop support for NodeJS 10 ([8f74291](https://gitlab.com/html-validate/html-validate/commit/8f74291919e1bcdab88ae6b74ba4199b16a4ef54))

### Dependency upgrades

- **deps:** update dependency ajv to v8 ([cccb73a](https://gitlab.com/html-validate/html-validate/commit/cccb73ad33db7f8032ecef469dc77a3df24eb29f))

## 4.14.0 (2021-06-14)

### Features

- new rule `attr-pattern` ([b813aeb](https://gitlab.com/html-validate/html-validate/commit/b813aeb7348d20b1cba2ea3df7c5bd7ac952e324)), closes [#118](https://gitlab.com/html-validate/html-validate/issues/118)
- new rule `input-attributes` ([23ee19e](https://gitlab.com/html-validate/html-validate/commit/23ee19eab292a97427ddc15db1bb77346489c002)), closes [#119](https://gitlab.com/html-validate/html-validate/issues/119)

### 4.13.1 (2021-05-28)

### Bug Fixes

- **jest:** fix `TypeError: diff is not a function` ([2afc2e8](https://gitlab.com/html-validate/html-validate/commit/2afc2e8796d9e2a8b9b79af91625f6d844860a53))

## 4.13.0 (2021-05-28)

### Features

- **jest:** better compatibility with jest in node environment ([79d14ca](https://gitlab.com/html-validate/html-validate/commit/79d14ca23bacf6848ce67b6f4ec853bbfee5f5a6))

### Dependency upgrades

- **deps:** support jest v27 ([863f73d](https://gitlab.com/html-validate/html-validate/commit/863f73dfec245a1a806bb7a6690fbc633887a334))
- **deps:** update dependency @sidvind/better-ajv-errors to ^0.9.0 ([8f6d162](https://gitlab.com/html-validate/html-validate/commit/8f6d1628a9dcc8554b17a37a31e29cdb98f2dd01))

## 4.12.0 (2021-05-17)

### Features

- **rules:** enforce initial heading-level in sectioning roots ([c4306ad](https://gitlab.com/html-validate/html-validate/commit/c4306ad6920005c760431c2681d37e2fc25949fd))

## 4.11.0 (2021-05-08)

### Features

- `dom:ready` and `dom:load` contains `source` reference ([430ec7c](https://gitlab.com/html-validate/html-validate/commit/430ec7c611ce5f09dfaa7e1e08febe756ee87db1)), closes [#115](https://gitlab.com/html-validate/html-validate/issues/115)
- add `:scope` pseudoselector ([6e3d837](https://gitlab.com/html-validate/html-validate/commit/6e3d83713ab74297a4b4af41f6b244c9e3d7822a)), closes [#114](https://gitlab.com/html-validate/html-validate/issues/114)
- add `isSameNode()` ([7d99007](https://gitlab.com/html-validate/html-validate/commit/7d99007b9458d2ff1ca37aae756dd2806837ca68))
- add new event `source:ready` ([4c1d115](https://gitlab.com/html-validate/html-validate/commit/4c1d115594f0eebdccfcbe6a6518a805b4a26929)), closes [#115](https://gitlab.com/html-validate/html-validate/issues/115)
- **rules:** `deprecated` takes `include` and `exclude` options ([e00d7c1](https://gitlab.com/html-validate/html-validate/commit/e00d7c161bf7244931378f51b3c481016d49aad6))

### Bug Fixes

- **dom:** throw if `tagName` is invalid ([42d7100](https://gitlab.com/html-validate/html-validate/commit/42d710020eb3c0e4d2e528859ed23a56095feb87))

### 4.10.1 (2021-04-25)

### Bug Fixes

- handle directives with excessive whitespace ([0400563](https://gitlab.com/html-validate/html-validate/commit/040056356589b7caf6ae18ee59d11a2f25c9ea44))

## 4.10.0 (2021-04-18)

### Features

- **dom:** implement {first,last}ElementChild accessors ([5e70aee](https://gitlab.com/html-validate/html-validate/commit/5e70aee128643dfcc01f1a8d1e894cc898ab0beb))
- **formatters:** `stylish` and `codeframe` displays links to error descriptions ([86cf213](https://gitlab.com/html-validate/html-validate/commit/86cf2136d227fadb9aa3d5eeb2eebe222f7a150d)), closes [#113](https://gitlab.com/html-validate/html-validate/issues/113)
- **formatters:** checkstyle output is indented ([e284fb7](https://gitlab.com/html-validate/html-validate/commit/e284fb72a551d99f92b3aaa3341a5749d9cfe2a5))
- **parser:** add full location to `attr` event (key, quotes, value) ([931a39f](https://gitlab.com/html-validate/html-validate/commit/931a39f04b140f6d16b28fee03396c12ecd1b5a2))
- **rules:** add rule url to `Message` ([6845fac](https://gitlab.com/html-validate/html-validate/commit/6845fac266c7748f679cbab94141db12319a822b))
- **rules:** new option `allowedProperties` to `no-inline-style` (defaults to `display`) ([75aa5f0](https://gitlab.com/html-validate/html-validate/commit/75aa5f0f446b9a14711b1c8b8d44fd6fd7ff84a7))

### Bug Fixes

- **rules:** rule documentation url for rules in subdirectories ([c91c36d](https://gitlab.com/html-validate/html-validate/commit/c91c36d561a332f2389deb795f9248e5cc21bffd))

## 4.9.0 (2021-04-04)

### Features

- add rule option schemas ([f88f0da](https://gitlab.com/html-validate/html-validate/commit/f88f0da04fa674e494dd2d25e8b997c06161a73f))
- **rules:** validate rule configuration ([5ab6a21](https://gitlab.com/html-validate/html-validate/commit/5ab6a21bc5cac30676ca9334bd3d68c1cad73f45))

### Bug Fixes

- **config:** validate preset configurations ([dca9fc3](https://gitlab.com/html-validate/html-validate/commit/dca9fc3fb60da5f88668a66584b9c5965e26d5c6))
- **error:** present original json for configuration errors ([23a50f3](https://gitlab.com/html-validate/html-validate/commit/23a50f33ddbb40c430ccdfb73195a3b76b335766))
- **meta:** memory leak when loading meta table ([940ca4e](https://gitlab.com/html-validate/html-validate/commit/940ca4e1759fd22c4e6b29267329c40cd3d7561e)), closes [#106](https://gitlab.com/html-validate/html-validate/issues/106)

## 4.8.0 (2021-03-28)

### Features

- support ignoring files with `.htmlvalidateignore` ([77ec9a6](https://gitlab.com/html-validate/html-validate/commit/77ec9a623c5fabcbd743394d0bb58887d44d73c1)), closes [#109](https://gitlab.com/html-validate/html-validate/issues/109)

### 4.7.1 (2021-03-19)

### Bug Fixes

- add `$schema` to `html5.json` ([9a89d30](https://gitlab.com/html-validate/html-validate/commit/9a89d30c7172d787cd365205345da9a4fc0ad2dd))

### 4.1.1 (2021-03-19)

### Bug Fixes

- `$schema` keyword being invalid ([3b67062](https://gitlab.com/html-validate/html-validate/commit/3b67062260c9e85e5d6213b7d3f8e6009c823264))

## 4.7.0 (2021-03-14)

### Features

- new rule `aria-label-misuse` ([b8c6eb7](https://gitlab.com/html-validate/html-validate/commit/b8c6eb7a12849dd9ce08e8d64fbc3aaec5b6d278)), closes [#110](https://gitlab.com/html-validate/html-validate/issues/110)
- support `.htmlvalidate.js` ([b694ddf](https://gitlab.com/html-validate/html-validate/commit/b694ddfa1afa05eb86689aa590a8d232d0d20f66)), closes [#111](https://gitlab.com/html-validate/html-validate/issues/111)

### Bug Fixes

- **dom:** `input[type="hidden"]` no longer labelable ([244d37d](https://gitlab.com/html-validate/html-validate/commit/244d37d3195afb50f75eed0b835f66c325d941e3))

### 4.6.1 (2021-03-02)

### Bug Fixes

- **dom:** `generateSelector()` escapes characters ([c2e316c](https://gitlab.com/html-validate/html-validate/commit/c2e316c6e980c7814d0a34102f8da529a111b5f6)), closes [#108](https://gitlab.com/html-validate/html-validate/issues/108)
- **dom:** `querySelector` handles escaped characters ([30e7503](https://gitlab.com/html-validate/html-validate/commit/30e75036b71dbf7564021b89a02aab11342647b7))
- **dom:** throw error when selector is missing pseudoclass name ([516ca06](https://gitlab.com/html-validate/html-validate/commit/516ca065dfcbc22d542f2336d91d0685f1870c64))

## 4.6.0 (2021-02-13)

### Features

- **parser:** add DOCTYPE tag to `DoctypeEvent` ([8c53d40](https://gitlab.com/html-validate/html-validate/commit/8c53d40b8ed3bbf8f5016cf58c63e75a09e4964e))
- **parser:** new event `token` emitted for each lexer token ([f9d44d6](https://gitlab.com/html-validate/html-validate/commit/f9d44d665c0c5f5522f9220ac8940c1d285b339e))
- **rules:** allow rules to unregister event listeners ([8b1a6bc](https://gitlab.com/html-validate/html-validate/commit/8b1a6bc3ce2c38d7ff6a68b8ea54a6b2784a6e45))
- **rules:** new rule `attr-spacing` requiring attributes to be separated by whitespace ([7734dc6](https://gitlab.com/html-validate/html-validate/commit/7734dc6855bb1fccbb0e66ddc7684c6ba997912a)), closes [#105](https://gitlab.com/html-validate/html-validate/issues/105)
- **rules:** new rule `doctype-style` requiring doctype to be specific case ([e94f819](https://gitlab.com/html-validate/html-validate/commit/e94f8191c6da0acf02b1322d140ff8afa3a8c33f))
- **rules:** new rule `no-utf8-bom` disallowing usage of UTF-8 BOM ([7a2d264](https://gitlab.com/html-validate/html-validate/commit/7a2d264f6ff805740a2c1ed3988327cd96441682))

### Bug Fixes

- **lexer:** handle CRLF after xml declaration ([97fd77d](https://gitlab.com/html-validate/html-validate/commit/97fd77de1467a9e97cc80fd1a4643b88701cbdb0))
- **lexer:** handle doctype with mixed case ([a40e28e](https://gitlab.com/html-validate/html-validate/commit/a40e28e2c115ae3382ef6b63827fdf1685134692))
- **lexer:** handle html comment before doctype ([6c1b830](https://gitlab.com/html-validate/html-validate/commit/6c1b830898534cbfed2adb5cb6b06abfdeaede1b))
- **lexer:** handle unicode bom ([97506b1](https://gitlab.com/html-validate/html-validate/commit/97506b1a8b143c9e686538fa02d349091b9076a3))

## 4.5.0 (2021-02-05)

### Features

- **meta:** `transparent` can be limited to specific elements ([bef8a16](https://gitlab.com/html-validate/html-validate/commit/bef8a1663b70539091c203d5a4167446513904b9))

### Bug Fixes

- **html5:** `<audio>` and `<video>` allows `<track>` and `<source>` transparently ([526006c](https://gitlab.com/html-validate/html-validate/commit/526006c6c95418ac7dac2d3ef9f7a9b4158b62d2)), closes [#104](https://gitlab.com/html-validate/html-validate/issues/104)

## 4.4.0 (2021-01-31)

### Features

- **events:** new event `tag:ready` emitted when start tag is parsed ([cfbf3dc](https://gitlab.com/html-validate/html-validate/commit/cfbf3dce948428dc3756ef60bba0a8968fbe089e))
- **events:** rename `tag:open` and `tag:close` to `tag:start` and `tag:end` ([7a2150f](https://gitlab.com/html-validate/html-validate/commit/7a2150f1f0b51f29bddeb782af2306de786f9529))
- **rules:** `heading-level` supports sectioning roots ([8149cc6](https://gitlab.com/html-validate/html-validate/commit/8149cc66e2e1fd66fc058157bda0157e271f8c96)), closes [#92](https://gitlab.com/html-validate/html-validate/issues/92)

### Bug Fixes

- **rules:** better error message for `heading-level` ([0871706](https://gitlab.com/html-validate/html-validate/commit/08717063a1b4b6f5eb88fb77cef5f5938c10e967))

### Dependency upgrades

- **deps:** update dependency @sidvind/better-ajv-errors to ^0.8.0 ([f317223](https://gitlab.com/html-validate/html-validate/commit/f31722364815f9001935330f6596df4bbb3a7204))

## 4.3.0 (2021-01-19)

### Features

- **rules:** new rule `text-content` ([2fef395](https://gitlab.com/html-validate/html-validate/commit/2fef3950e5c2e407ca206fbcf82d90793488c2da)), closes [#101](https://gitlab.com/html-validate/html-validate/issues/101)
- **transform:** new helper `processElement` for writing tests ([3052f81](https://gitlab.com/html-validate/html-validate/commit/3052f81edcebca58551c77d378b2e5357db47f3a))
- add `browser` entry point without cli classes ([7840ec2](https://gitlab.com/html-validate/html-validate/commit/7840ec2a7f823c57e7e4f50055f4bb873f961dc7))
- set `sideEffects` to `false` ([41b47f8](https://gitlab.com/html-validate/html-validate/commit/41b47f8bc21501e4615cd8bc887a0ffaf2869454))

### Bug Fixes

- **dom:** `DOMTokenList` (such as `classlist`) handles newlines and tabs ([35e601e](https://gitlab.com/html-validate/html-validate/commit/35e601e22c6a04f93f252810caed6b8bbb182225))

## 4.2.0 (2021-01-15)

### Features

- **dom:** disable cache until node is fully constructed ([5e35c49](https://gitlab.com/html-validate/html-validate/commit/5e35c498f790be65928989a327c40772b3fb7184))
- **htmlvalidate:** add `getConfigurationSchema()` to get effective configuration schema ([1dd81d9](https://gitlab.com/html-validate/html-validate/commit/1dd81d993508720b13b8c094867bd780da002b84))
- **htmlvalidate:** add `getElementsSchema()` to get effective elements schema ([4baac36](https://gitlab.com/html-validate/html-validate/commit/4baac36ecb608dd2ef83bbf3c284d08ed05d1087)), closes [#78](https://gitlab.com/html-validate/html-validate/issues/78)
- **rule:** support filter callback for rule events ([f3f949c](https://gitlab.com/html-validate/html-validate/commit/f3f949cd5f2cdef526bc1c60d9176f4ae57890ee))
- **rules:** add `allowMultipleH1` option to `heading-level` ([a33071d](https://gitlab.com/html-validate/html-validate/commit/a33071d12807770a9484c5d713b7037c354d8fe1))

### Bug Fixes

- enable `strictNullCheck` ([64b5af2](https://gitlab.com/html-validate/html-validate/commit/64b5af25723e6441a133a0a561a941d3f8a2daa0)), closes [#76](https://gitlab.com/html-validate/html-validate/issues/76)
- **event:** `location` property can be `null` for some events ([fbbc87c](https://gitlab.com/html-validate/html-validate/commit/fbbc87cf5d62d2a102d86cb8165e9d3dac630474))
- **event:** pass `null` when attribute value is missing ([08c2876](https://gitlab.com/html-validate/html-validate/commit/08c2876dc8f4e01f4c4b0aa97de9672b43476ca3))
- **rules:** rule options uses `Partial<T>` ([221113b](https://gitlab.com/html-validate/html-validate/commit/221113b41adcd9fd8ab5bc10aa9a8d6723b40db6))

### Dependency upgrades

- **deps:** update dependency ajv to v7 ([4c04388](https://gitlab.com/html-validate/html-validate/commit/4c043884a74083274f729ed0d3d40406f9163799))

## 4.1.0 (2020-12-14)

### Features

- replace `inquirer` with `prompts` ([82d17eb](https://gitlab.com/html-validate/html-validate/commit/82d17ebce26d0e215fa689095fb2822ae541f2d8))

### 4.0.2 (2020-11-19)

### Bug Fixes

- **deps:** replace dependency on `eslint` with `@html-validate/stylish` ([2d1bc81](https://gitlab.com/html-validate/html-validate/commit/2d1bc819bd241294db55fc28dd7305ee46d9ad3f))

### 4.0.1 (2020-11-09)

### Bug Fixes

- **rules:** `wcag/h32` checks for `type="image"` ([4a43819](https://gitlab.com/html-validate/html-validate/commit/4a43819d90db59ae31846f766025d4ffce189391))
- **rules:** `wcag/h32` handles submit buttons using `form` attribute to associate ([cb2e843](https://gitlab.com/html-validate/html-validate/commit/cb2e8437ae6ca4a14b0fb4585cdec3157c5cf2a0))

## 4.0.0 (2020-11-07)

### ⚠ BREAKING CHANGES

- **config:** With this release any custom configuration files will no longer
  automatically extend `html-validate:recommended`.

The previous behaviour was to to always merge with the default configuration
containing `extends: ["html-validate:recommended"]`. This is counter-intuitive
when adding a blank `{}` `.htmlvalidate.json` configuration file (or a file with
`extends: []`). The new behaviour is to not apply default configuration if
another configuration is found.

To retain the previous behaviour you must ensure your configuration contains
`extends: ["html-validate:recommended"]`. Users who have `root: true` are not
affected. _If unsure: test your configuration by deliberatly introducing and
error and verify it is detected_.

For CLI users: ensure your `.htmlvalidate.json` configuration files are updated.

For IDE integration users: ensure your `.htmlvalidate.json` configuration files
are updated.

For `CLI` API users: same as with CLI the configuration loading has changed and
all users must update their `.htmlvalidate.json` accordingly.

For `HtmlValidate` API users: you are most likely not affected, only if both of
the following conditions are true you need to take care to ensure any
`.htmlvalidate.json` is updated:

1. you are using `validateFile` or supply filenames to other validation
   functions.
2. you allow user-supplied configurations (or use them yourself) via
   `.htmlvalidate.json` (default unless `root: true` is set in the configuration
   object passed to `new HtmlValidate(..)`)

The `ConfigLoader` API has also been updated and `fromTarget` may now return
`null` if no configuration file was found.

- The `build` folder has been renamed to `dist`.

This affects API users only and in general should not be an issue unless
importing files via full path. In that case replace `import 'html-validate/build/...'` with `import 'html-validate/dist/...` but in general
those imports are discouraged.

Instead users should import only via `import { ... } from "html-validate"` and file an issue
if an export is missing.

This does not affect the `elements` imports which is considered a safe to import
as-is.

- Only node 10 or later is supported

### Features

- new utility function `ruleExists` to test presence of bundled rules ([09aad04](https://gitlab.com/html-validate/html-validate/commit/09aad040f201f91bdf47a4b0cf8e79ee05b9ff9c))
- **rules:** new helper `isHTMLHidden` ([ae20335](https://gitlab.com/html-validate/html-validate/commit/ae20335fbe45f368ef29844ce23541d41387899f))
- **shim:** add new export `html-validate/test-utils` exposing test-utils ([30f5d40](https://gitlab.com/html-validate/html-validate/commit/30f5d40379273c36871a487a55d83eb641fde037))
- **shim:** expose all event structures in shim ([294bb0d](https://gitlab.com/html-validate/html-validate/commit/294bb0d9ac40034d9863195d15fbdf9afa1e4d20))
- **shim:** expose metadata structures ([271e521](https://gitlab.com/html-validate/html-validate/commit/271e521795e47d539ac3cab73be7091269845cd6))

### Bug Fixes

- **config:** dont automatically apply `extends: ["html-validate:recommended"]` ([fcad0b2](https://gitlab.com/html-validate/html-validate/commit/fcad0b2a71bb007237058039eb907d8623e9188c)), closes [#98](https://gitlab.com/html-validate/html-validate/issues/98)
- require node 10 ([d1a48b1](https://gitlab.com/html-validate/html-validate/commit/d1a48b18353d5888bc25a133377aef622f926282))
- **rules:** `input-missing-label` handles multiple labels ([a6af2da](https://gitlab.com/html-validate/html-validate/commit/a6af2da352e1ed86e7f17c2018ddd2a925a49397))
- **rules:** `input-missing-label` ignores hidden `<input>` ([41c39e9](https://gitlab.com/html-validate/html-validate/commit/41c39e916fdf3579ec31d6fc6f36d951e92fd497))
- **rules:** `input-missing-label` requires label to be non-hidden ([ff5e855](https://gitlab.com/html-validate/html-validate/commit/ff5e8559c7ee3039d0ef515f5ed45bcd0c3b8724)), closes [#99](https://gitlab.com/html-validate/html-validate/issues/99)

### Miscellaneous Chores

- migrate to `dist` folder ([3c6787c](https://gitlab.com/html-validate/html-validate/commit/3c6787c27e0c4e68c8c33318df06065ce408aefa))

# 3.5.0 (2020-10-18)

### Features

- **rules:** new rule `no-multiple-main` ([fa3c065](https://gitlab.com/html-validate/html-validate/commit/fa3c065f2968829bafd0c20ae52158d725be27ca))

## 3.4.1 (2020-10-13)

### Bug Fixes

- **rules:** ignore links hidden from accessibility tree - fixes [#97](https://gitlab.com/html-validate/html-validate/issues/97) ([064514b](https://gitlab.com/html-validate/html-validate/commit/064514b83efbbe1a42fdad719d57af7f1b8106ef))

# 3.4.0 (2020-10-08)

### Bug Fixes

- **deps:** update dependency acorn-walk to v8 ([5a41662](https://gitlab.com/html-validate/html-validate/commit/5a41662b6800a8400d493364d35db385300801a9))
- **rules:** fix issue in `no-dup-id` where value is dynamic ([203debe](https://gitlab.com/html-validate/html-validate/commit/203debef4c942f2ef8ab98848453a7fc3c534066)), closes [#96](https://gitlab.com/html-validate/html-validate/issues/96)

### Features

- **api:** add additional prototypes to `validateString` ([69e8102](https://gitlab.com/html-validate/html-validate/commit/69e81024ed6a077e92d32f79791e6b47e0ad0364))
- **dom:** new api for caching data on `DOMNode` ([13d99e4](https://gitlab.com/html-validate/html-validate/commit/13d99e4973a84109c9069fbe1718a33a302325d1))
- **rules:** implement caching in some helper methods ([5746d6c](https://gitlab.com/html-validate/html-validate/commit/5746d6cf37c6ca82bb5d3543f67b33341db0fdc5))

# 3.3.0 (2020-09-08)

### Bug Fixes

- **jest:** add missing `filename` to typescript declaration ([4be48fa](https://gitlab.com/html-validate/html-validate/commit/4be48fa1323f28719bf3909643eec91c9ed455eb))
- **meta:** default to pass when testing excluded category from unknown element ([07afa1a](https://gitlab.com/html-validate/html-validate/commit/07afa1aa7cb5f302b9caca74b923a5342c4a330c))
- **rules:** handle unknown elements better in `element-permitted-content` ([58ba1aa](https://gitlab.com/html-validate/html-validate/commit/58ba1aa4a7fcbee7743db10c27b6429420c07f8e)), closes [#95](https://gitlab.com/html-validate/html-validate/issues/95)

### Features

- **jest:** `toHTMLValidate()` supports passing expected errors ([7b3c30e](https://gitlab.com/html-validate/html-validate/commit/7b3c30e622130e93c4bc03e6455f94d85e746b84))

# 3.2.0 (2020-08-26)

### Features

- **rules:** new rule allowed-links ([d876206](https://gitlab.com/html-validate/html-validate/commit/d8762060c6a8b5b2f6a67cbbffd229b8232a7dfa))

# 3.1.0 (2020-08-20)

### Bug Fixes

- **rules:** `no-redundant-for` should only target `<label>` ([a2395b6](https://gitlab.com/html-validate/html-validate/commit/a2395b6d75c6aefba9c44b38dcecb72cad4d0110))

### Features

- **meta:** new property `labelable` ([bf5cd6e](https://gitlab.com/html-validate/html-validate/commit/bf5cd6ef422036d9c0d4e6d8b677d218fb0f014d))
- **rules:** new rule `multiple-labeled-controls` ([ee28774](https://gitlab.com/html-validate/html-validate/commit/ee287745fa75a2ab8cb6a4362c99e95bd59aaac6)), closes [#86](https://gitlab.com/html-validate/html-validate/issues/86)
- **rules:** new rule `no-redundant-for` ([d4445bb](https://gitlab.com/html-validate/html-validate/commit/d4445bb1453408afddf10113acf1db89afd30f7b)), closes [#87](https://gitlab.com/html-validate/html-validate/issues/87)

# 3.0.0 (2020-06-21)

### Bug Fixes

- **deps:** update dependency chalk to v4 ([614da1b](https://gitlab.com/html-validate/html-validate/commit/614da1b060409cddca0bad8435fb2c2385415e5a))
- **deps:** update dependency eslint to v7 ([186be9b](https://gitlab.com/html-validate/html-validate/commit/186be9baa65e61b51c4d76ef8fbfae9bb4be8c79))
- **deps:** update dependency espree to v7 ([863cd0f](https://gitlab.com/html-validate/html-validate/commit/863cd0f595535721498848d9ce433cf8fedd4e3a))

### chore

- drop node 8 support ([b0a6731](https://gitlab.com/html-validate/html-validate/commit/b0a673101ca2c49877f71bfc0600cb651e7a505f))

### BREAKING CHANGES

- Node 8 support has been removed.

## 2.23.1 (2020-06-21)

### Bug Fixes

- **rules:** `no-trailing-whitespace` handles CRLF (windows) newlines ([2aaddc2](https://gitlab.com/html-validate/html-validate/commit/2aaddc2daaa219f16031cc105e0d396387eac07c)), closes [#93](https://gitlab.com/html-validate/html-validate/issues/93)

# 2.23.0 (2020-05-18)

### Bug Fixes

- **cli:** `expandFiles` path normalization for windows ([b902853](https://gitlab.com/html-validate/html-validate/commit/b902853e696a04202959ae6c4cf086bd48911e4d))

### Features

- **config:** add two new config presets `html-validate:standard` and `html-validate:a17y` ([36bf9ec](https://gitlab.com/html-validate/html-validate/commit/36bf9ec3be7356d534d352d00610d8253885de22)), closes [#90](https://gitlab.com/html-validate/html-validate/issues/90)
- **rules:** add `include` and `exclude` options to `prefer-button` ([b046dc5](https://gitlab.com/html-validate/html-validate/commit/b046dc5943a4bd05dff9766ea6b9c9f522c09d1a)), closes [#90](https://gitlab.com/html-validate/html-validate/issues/90)
- **rules:** add `isKeywordExtended` method for rule authors ([ca7e835](https://gitlab.com/html-validate/html-validate/commit/ca7e835d384c7ed43967bec14f56836353a0b1f6))

# 2.22.0 (2020-05-15)

### Bug Fixes

- **elements:** add `<details>` and `<summary>` elements ([47ba673](https://gitlab.com/html-validate/html-validate/commit/47ba6739951a37bdb285400d392ff27ec57ff89e)), closes [#89](https://gitlab.com/html-validate/html-validate/issues/89)
- `<legend>` should allow heading elements ([73e150f](https://gitlab.com/html-validate/html-validate/commit/73e150f13a8b797458dac4fcbe3a22997422f4d9))
- **deps:** update dependency json-merge-patch to v1 ([e9f83d2](https://gitlab.com/html-validate/html-validate/commit/e9f83d2047aed16e81fe006795c9b30111478534))

### Features

- **rules:** new rule `no-autoplay` ([9ed5474](https://gitlab.com/html-validate/html-validate/commit/9ed5474493eedebd2db5c673060538d244b69f63)), closes [#84](https://gitlab.com/html-validate/html-validate/issues/84)

# 2.21.0 (2020-04-26)

### Bug Fixes

- **meta:** throw schema validation error when element metadata does not validate ([6ecf050](https://gitlab.com/html-validate/html-validate/commit/6ecf0501f3f8284c9248ac5fd0643d1c32049333)), closes [#81](https://gitlab.com/html-validate/html-validate/issues/81)
- **schema:** allow `permittedContent` and `permittedDescendants` to use AND-syntax ([2fa742c](https://gitlab.com/html-validate/html-validate/commit/2fa742c03b84145d0fa334809ff1f98f80cfc263)), closes [#82](https://gitlab.com/html-validate/html-validate/issues/82)
- **transform:** expose `computeOffset` ([d033538](https://gitlab.com/html-validate/html-validate/commit/d033538c58ff921026fc3a025e679c8b8f2e144e))

### Features

- **dom:** `DOMTokenList` can extract location data for each token ([4f4dfe0](https://gitlab.com/html-validate/html-validate/commit/4f4dfe05ccdb93c8ba27754e8ae9785fc91508eb)), closes [#74](https://gitlab.com/html-validate/html-validate/issues/74)
- **rules:** add `include` and `exclude` options to `no-inline-style` ([6604e88](https://gitlab.com/html-validate/html-validate/commit/6604e88e96d59c67d596b92be760b1ba5a971589)), closes [html-validate/html-validate-angular#3](https://gitlab.com/html-validate/html-validate-angular/issues/3)
- **rules:** use more precise location from `DOMTokenList` ([e874784](https://gitlab.com/html-validate/html-validate/commit/e874784858badb3a448cc739189cdac5ef577efe))

## 2.20.1 (2020-04-19)

### Bug Fixes

- handle loading js-files via `extends` again ([e29987f](https://gitlab.com/html-validate/html-validate/commit/e29987f213a1f295751c285c582209047c68bc2b))

# 2.20.0 (2020-04-05)

### Bug Fixes

- **meta:** add missing null return type to MetaTable.getMetaFor ([44eac5b](https://gitlab.com/html-validate/html-validate/commit/44eac5b4efffdd0bcf6973364b595501eabe9b25))
- allow loading elements from js-file again ([5569a94](https://gitlab.com/html-validate/html-validate/commit/5569a9428cef8ca168d79a2e75be851e141838e8))
- make `ast` property private ([cb1a2c8](https://gitlab.com/html-validate/html-validate/commit/cb1a2c867583616819488102a3a46431821615a6))

### Features

- support loading custom formatters ([0b02a31](https://gitlab.com/html-validate/html-validate/commit/0b02a31c4f34cca840c9ada60e76634976461f38))
- **formatters:** use factory to load formatters to make it more webpack-friendly ([81bef6e](https://gitlab.com/html-validate/html-validate/commit/81bef6e79287884ee2a6c804cefe136e222c1b78))

# 2.19.0 (2020-03-24)

### Bug Fixes

- **meta:** deep merge during inheritance ([85c377d](https://gitlab.com/html-validate/html-validate/commit/85c377d185492407d72fde39bd14d6a80935a56a)), closes [#72](https://gitlab.com/html-validate/html-validate/issues/72)

### Features

- **meta:** implicit inheritance when overriding existing element ([8833a0f](https://gitlab.com/html-validate/html-validate/commit/8833a0fcc9873eee4938619cdae78afa45e48ce5))

## 2.18.1 (2020-03-22)

### Bug Fixes

- **meta:** allow regexp literal in element schema ([444a472](https://gitlab.com/html-validate/html-validate/commit/444a4726f7b8693188ad80c725f57f0e33844ca7)), closes [#70](https://gitlab.com/html-validate/html-validate/issues/70)
- **meta:** make all meta properties optional in type declaration ([eac5052](https://gitlab.com/html-validate/html-validate/commit/eac505234e2bdac2fb6d19ba8ef81bd947a7bba9))
- **meta:** support case-insensitive regexp flag ([96e7343](https://gitlab.com/html-validate/html-validate/commit/96e734396f9ee90358a4b74e091f14387eda9c99)), closes [#69](https://gitlab.com/html-validate/html-validate/issues/69)
- **rules:** use original wcag rule names ([1d5aa3c](https://gitlab.com/html-validate/html-validate/commit/1d5aa3c83add6b51bf062508cbaf9a868572446f))

### Reverts

- Revert "ci: temporary add debug to troubleshoot @semantic-release/gitlab" ([b4d016b](https://gitlab.com/html-validate/html-validate/commit/b4d016b442e618b38b5140de17d59b6393956ded))

# 2.18.0 (2020-03-11)

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

## 2.17.1 (2020-03-02)

### Bug Fixes

- disable `void-style` when using `toHTMLValidate` matcher ([4d6bb3d](https://gitlab.com/html-validate/html-validate/commit/4d6bb3d7fe8f0e174082eb3c39d7f6dcd9109f56))

# 2.17.0 (2020-02-17)

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

# 2.16.0 (2020-02-12)

### Bug Fixes

- **cli:** fix typo when using `--init` with vuejs ([6eee478](https://gitlab.com/html-validate/html-validate/commit/6eee47872e164b16e4152f309ab5971019222ff9))
- **dom:** `querySelector` and friends return empty when selector is empty ([6a871de](https://gitlab.com/html-validate/html-validate/commit/6a871de7bb240507693d266b37c6e4f9228b7e5e))
- **schema:** add title and description to most properties ([a7cea78](https://gitlab.com/html-validate/html-validate/commit/a7cea78ed39643e5808cfd08243f492a235200e7))
- **schema:** handle `$schema` in config and elements ([a4f9054](https://gitlab.com/html-validate/html-validate/commit/a4f90541c74070f30d033827789336ad27063b3a))
- add missing `jest.js` and `jest.d.ts` ([8b767c2](https://gitlab.com/html-validate/html-validate/commit/8b767c2032297b8534c7feac98414fc4d90c5bd2))

### Features

- add import `html-validate/jest` as a shortcut to the jest matchers ([4ccf6ed](https://gitlab.com/html-validate/html-validate/commit/4ccf6ed6b1da47d44bb256db4156edbdbb1ddf4e))
- expose `NodeClosed`, `TextNode`, `Plugin` and `Parser` ([f344527](https://gitlab.com/html-validate/html-validate/commit/f3445274d4e713e2c851bd524ebb429da9408abb))

# 2.15.0 (2020-02-09)

### Features

- **plugin:** load `default` transformer if loading named transformer without name ([efb0eb9](https://gitlab.com/html-validate/html-validate/commit/efb0eb9de250ad80f812bd2a0d6bd6c96d21a41a))

# 2.14.0 (2020-02-06)

### Features

- **elements:** make `<legend>` in `<fieldset>` optional (covered by new h71 rule instead) ([f3a59b9](https://gitlab.com/html-validate/html-validate/commit/f3a59b917addb05e920b30e7ce32c1be375157e2))
- **rules:** new method `getTagsDerivedFrom` to get tag and tags inheriting from it ([0118738](https://gitlab.com/html-validate/html-validate/commit/011873818a5e8997887547895a5be519baa589b0))
- **rules:** new rule `wcag/h71` requiring `<fieldset>` to have `<legend>` ([1b8ceab](https://gitlab.com/html-validate/html-validate/commit/1b8ceab724e9bb886b6b9d08a1c7563163786ad9))

# 2.13.0 (2020-02-02)

### Features

- **meta:** allow plugins to add copyable metadata ([242eaa8](https://gitlab.com/html-validate/html-validate/commit/242eaa882afb71e527b07a2a92e6d45adf4f02e7))

# 2.12.0 (2020-01-27)

### Bug Fixes

- **rules:** don't report elements where the tag is already correct ([ee354a0](https://gitlab.com/html-validate/html-validate/commit/ee354a0070f4ac6657cf0a5ce84bddadb3d2dab7)), closes [#65](https://gitlab.com/html-validate/html-validate/issues/65)

### Features

- **rules:** new rule no-redundant-role ([a32b816](https://gitlab.com/html-validate/html-validate/commit/a32b81623ac4c8603923b4ff1a41c342a5dfe1d2)), closes [#65](https://gitlab.com/html-validate/html-validate/issues/65)

# 2.11.0 (2020-01-26)

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

# 2.10.0 (2020-01-22)

### Features

- **rules:** make options type-safe ([c85342a](https://gitlab.com/html-validate/html-validate/commit/c85342a5426ddba081fed8becaf3d4d499f0b66e))
- **rules:** new rule `prefer-native-element` ([06c44ce](https://gitlab.com/html-validate/html-validate/commit/06c44cec1c66b518c030a31517d8cfd454c0c2d2))

# 2.9.0 (2020-01-17)

### Features

- **jest:** add `toHTMLValidate()` ([44388ea](https://gitlab.com/html-validate/html-validate/commit/44388ea0f759a33831967859386299d95b528c63))
- **rules:** check references from `aria-controls` ([9e9805d](https://gitlab.com/html-validate/html-validate/commit/9e9805dc0e89e92411f7845a4fedc7ade0ca8cdd))

## 2.8.2 (2020-01-09)

### Bug Fixes

- create directory only if missing ([5db6fe8](https://gitlab.com/html-validate/html-validate/commit/5db6fe8ad82ba04d691dec5aacfcba9be8aee759))

## 2.8.1 (2020-01-06)

### Bug Fixes

- **cli:** create output directory as needed ([b5569f3](https://gitlab.com/html-validate/html-validate/commit/b5569f3abd47c02348f2aa31a430e1ab31ba65a5))
- **meta:** load metadata with `readFile` instead of `require` ([c5de95b](https://gitlab.com/html-validate/html-validate/commit/c5de95b8a41707bd58a688f130e8beecbece077a))

# 2.8.0 (2020-01-02)

### Features

- **rule:** validate matching case for start and end tags ([288cf86](https://gitlab.com/html-validate/html-validate/commit/288cf867dc6b1fdaf899cc695bb70b35c9a720a0))
- **rules:** refactor `parseStyle` from `element-case` and `attr-case` ([24d8fad](https://gitlab.com/html-validate/html-validate/commit/24d8fad19ba677502e1c19f8180efea44aa9cf34))
- **rules:** support multiple case styles ([5a397bd](https://gitlab.com/html-validate/html-validate/commit/5a397bd9aa281710f24925bec8dcc1bc29605403)), closes [#50](https://gitlab.com/html-validate/html-validate/issues/50)
- **rules:** support pascalcase and camelcase for `element-case` rule ([be7d692](https://gitlab.com/html-validate/html-validate/commit/be7d692838826a0de908d6cbb2867d02c43cee66))

# 2.7.0 (2019-12-16)

### Bug Fixes

- **config:** more helpful error when user forgot to load plugin ([62bbbe5](https://gitlab.com/html-validate/html-validate/commit/62bbbe503a5674369f24cf2a7116518b64cc2146))

### Features

- **config:** configuration schema validation ([c9fe45f](https://gitlab.com/html-validate/html-validate/commit/c9fe45fe4de2c807ec9dbed8126698f2480a7135)), closes [#61](https://gitlab.com/html-validate/html-validate/issues/61)
- **dom:** allow plugins to modify element annotation ([979da57](https://gitlab.com/html-validate/html-validate/commit/979da571ab69f22519973e7deda7531fc2560237))
- **dom:** allow plugins to modify element metadata ([cbe3e78](https://gitlab.com/html-validate/html-validate/commit/cbe3e78561e38b0abcef0a7d87a0e2aa6897ccb3)), closes [#62](https://gitlab.com/html-validate/html-validate/issues/62)
- **elements:** make schema publicly accessible ([bcab9e4](https://gitlab.com/html-validate/html-validate/commit/bcab9e4121d80fe92cdd12da84925e07e5b98297))
- **rules:** use annotated name ([1895ef4](https://gitlab.com/html-validate/html-validate/commit/1895ef4311c36cca17e8c68ebd58724df082c335))

# 2.6.0 (2019-12-12)

### Bug Fixes

- **cli:** useful error message when metadata is invalid ([165da72](https://gitlab.com/html-validate/html-validate/commit/165da729ade4f64a946b83f6cd8b57a69186f51d))
- **elements:** allow `requiredAttributes` and others to be empty array ([244d038](https://gitlab.com/html-validate/html-validate/commit/244d0384ca62a5f73985116699690dd87e3fbea1)), closes [#59](https://gitlab.com/html-validate/html-validate/issues/59)
- **error:** better schema validation error ([9a5f8fe](https://gitlab.com/html-validate/html-validate/commit/9a5f8fe0a6d7fddd53e1002c028fd0218febfede))

### Features

- **lexer:** handle rudimentary template tags such as `<% .. %>` ([a0f6190](https://gitlab.com/html-validate/html-validate/commit/a0f619045642fabac73d6fff6a1d832f37fdc075))

# 2.5.0 (2019-12-09)

### Bug Fixes

- **config:** keep track of plugin original name ([9e7ea3e](https://gitlab.com/html-validate/html-validate/commit/9e7ea3e2b36cc71c5e098004bd6e1d232b413ca7))
- **config:** throw error is plugin is missing ([bc61a6b](https://gitlab.com/html-validate/html-validate/commit/bc61a6be2684a53c1704edc62e85a401ca08c1f0))
- **htmlvalidate:** more verbose output from `--dump-source` ([f0089c6](https://gitlab.com/html-validate/html-validate/commit/f0089c68e851f85f873a0b6d741d8b36520a26ee))
- **htmlvalidate:** prefer html-validate:recommended ([8deb03a](https://gitlab.com/html-validate/html-validate/commit/8deb03a246c38afb790aff7c01db602e121baefe))

### Features

- **htmlvalidate:** new method `canValidate` to test if a file can be validated ([f523028](https://gitlab.com/html-validate/html-validate/commit/f5230285017acf3f83838c3f36293d8f5545082d))

## 2.4.3 (2019-12-08)

### Bug Fixes

- **parser:** report parser-error when stream ends before required token ([50e1d67](https://gitlab.com/html-validate/html-validate/commit/50e1d67c5c79b44d53fe3889ee76ed9577c04865))

## 2.4.2 (2019-12-05)

### Bug Fixes

- **config:** handle exceptions from loading plugin ([3aec3f3](https://gitlab.com/html-validate/html-validate/commit/3aec3f3ff019f5e3815d4b04e66ee610469e815d)), closes [#55](https://gitlab.com/html-validate/html-validate/issues/55)

## 2.4.1 (2019-12-02)

### Bug Fixes

- **lexer:** handle missing `Source` properties (like `offset`) ([2092942](https://gitlab.com/html-validate/html-validate/commit/20929425dd69eadcc5432d11f33b53a35050b76c))

# 2.4.0 (2019-12-01)

### Bug Fixes

- **config:** `init` can now safely be called multiple times ([ed46c19](https://gitlab.com/html-validate/html-validate/commit/ed46c19ef8c3f8a01a5db51f0a879f10fde597a4))
- **htmlvalidate:** initialize global config if needed ([6d05747](https://gitlab.com/html-validate/html-validate/commit/6d05747de0114b72188955a8c2a11f3816dfdc6d))

### Features

- **htmlvalidate:** retain `offset` when yielding multiple sources ([fe1705e](https://gitlab.com/html-validate/html-validate/commit/fe1705e13950c0bbb281e1806432b12d3eebed1a))
- **transform:** add `offsetToLineColumn` helper ([1e61d00](https://gitlab.com/html-validate/html-validate/commit/1e61d001fcd29d434bd2d68a7e7d9a8a12feea5b))

# 2.3.0 (2019-11-27)

### Bug Fixes

- **config:** update `--init` config for html-validate-vue@2 ([6553ded](https://gitlab.com/html-validate/html-validate/commit/6553ded78cf8cd51c8eec9ba2ef08f8e25e84612))

### Features

- **transform:** support `hasChain` to test if a transformer is present ([e8ef4f5](https://gitlab.com/html-validate/html-validate/commit/e8ef4f5e1f89c70bad43cbf5d04f47789080ab4e))

# 2.2.0 (2019-11-23)

### Bug Fixes

- **config:** throw ConfigError when elements cannot be loaded ([62c08e7](https://gitlab.com/html-validate/html-validate/commit/62c08e7c8bf9deaa47f8b9f1afbf48dcc69bba32))
- **docs:** update plugin docs ([340d0ca](https://gitlab.com/html-validate/html-validate/commit/340d0ca23875331b4267a7fd0226532904ed8fda))
- **plugin:** make all fields optional ([a587239](https://gitlab.com/html-validate/html-validate/commit/a5872397a9a0732a4cea1901c65e024767809d4a))

### Features

- **plugin:** allow specifying name ([6554f72](https://gitlab.com/html-validate/html-validate/commit/6554f72fb11e2da59ab07774f0898b20654e2a5b))

# 2.1.0 (2019-11-21)

### Bug Fixes

- **deps:** update dependency chalk to v3 ([f84bd35](https://gitlab.com/html-validate/html-validate/commit/f84bd35b637e558cdcaf01fec9ed6ebc52d895ca))
- **rules:** wcag/h32 support custom form elements ([e00e1ed](https://gitlab.com/html-validate/html-validate/commit/e00e1ed30e714b679e161308daa07df80e89edde))

### Features

- **meta:** add method to query all tags with given property ([eb3c593](https://gitlab.com/html-validate/html-validate/commit/eb3c59343efa911e4e5ed22f4eb87408e3036325))
- **meta:** adding `form` property ([edf05b0](https://gitlab.com/html-validate/html-validate/commit/edf05b09d0600be548b4d52b79421f6d13713010))
- **meta:** allow inheritance ([5c7725d](https://gitlab.com/html-validate/html-validate/commit/5c7725d5d5062e3a55fd189ccd29712bd4cc26cd))
- **meta:** support [@form](https://gitlab.com/form) category ([66d75a8](https://gitlab.com/html-validate/html-validate/commit/66d75a86783f247c62302c431ab8ce35d22b4215))

## 2.0.1 (2019-11-19)

### Bug Fixes

- **config:** better error when loading missing transformer from plugin ([db48a01](https://gitlab.com/html-validate/html-validate/commit/db48a015888a18dc2f6a17fd8466a98d29882509))
- **config:** fix loading non-plugin transformer with plugin present ([c9ad080](https://gitlab.com/html-validate/html-validate/commit/c9ad08087305a4c36821a66552d4b7389fc42e86)), closes [#54](https://gitlab.com/html-validate/html-validate/issues/54)

# 2.0.0 (2019-11-17)

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

# 1.16.0 (2019-11-09)

### Bug Fixes

- **cli:** fix `--init` not creating configuration unless overwriting ([9098529](https://gitlab.com/html-validate/html-validate/commit/90985293bf941c54055c93b35a6c6f865a2f65e6))
- **config:** use `readFile` to prevent unintended caching ([4864bfa](https://gitlab.com/html-validate/html-validate/commit/4864bfa26edaf77b7bf7b0f551ffe7469a803c42))

### Features

- **shim:** expose version number in shim ([890d122](https://gitlab.com/html-validate/html-validate/commit/890d12269cfbfff7ce6b4e49e1876bb51ca7ccdd))

# 1.15.0 (2019-11-03)

### Bug Fixes

- **cli:** `--help` does not take an argument ([e22293f](https://gitlab.com/html-validate/html-validate/commit/e22293fc3257f6ba9732016d2be44214299e23c2))

### Features

- **cli:** add `--dump-source` to debug transformers ([4d32a0d](https://gitlab.com/html-validate/html-validate/commit/4d32a0d6fc8e3caaa62107affa94fe0fe16aab1f))
- **cli:** add `--init` to create initial configuration ([6852d30](https://gitlab.com/html-validate/html-validate/commit/6852d30dcbccc5ebed3267c6dd181146156646f0))

## 1.14.1 (2019-10-27)

### Bug Fixes

- input hidden should not have label ([66cf13d](https://gitlab.com/html-validate/html-validate/commit/66cf13d489cbb641fabe83121fa0f135440875f8)), closes [#53](https://gitlab.com/html-validate/html-validate/issues/53)

# 1.14.0 (2019-10-20)

### Features

- **shim:** expose more types ([86bb78d](https://gitlab.com/html-validate/html-validate/commit/86bb78d))
- enable typescript strict mode (excect strict null) ([5d2b45e](https://gitlab.com/html-validate/html-validate/commit/5d2b45e))
- **htmlvalidate:** support passing filename to `validateString` ([c2e09a2](https://gitlab.com/html-validate/html-validate/commit/c2e09a2))

# 1.13.0 (2019-10-13)

### Features

- **rules:** support deprecating rules ([de80d96](https://gitlab.com/html-validate/html-validate/commit/de80d96))

# 1.12.0 (2019-10-08)

### Features

- **cli:** new API to get validator instance ([6f4be7d](https://gitlab.com/html-validate/html-validate/commit/6f4be7d))
- **cli:** support passing options to CLI class ([aa544d6](https://gitlab.com/html-validate/html-validate/commit/aa544d6))
- **config:** add `root` property to stop searching file system ([9040ed5](https://gitlab.com/html-validate/html-validate/commit/9040ed5))
- **shim:** expose HtmlElement in shim ([dbb673f](https://gitlab.com/html-validate/html-validate/commit/dbb673f))

# 1.11.0 (2019-09-23)

### Bug Fixes

- **config:** expand `<rootDir>` in elements ([eeddf4c](https://gitlab.com/html-validate/html-validate/commit/eeddf4c))

### Features

- **meta:** new property `scriptSupporting` ([c271a04](https://gitlab.com/html-validate/html-validate/commit/c271a04))

# 1.10.0 (2019-09-19)

### Features

- **api:** better exposure of cli api ([2c16c5b](https://gitlab.com/html-validate/html-validate/commit/2c16c5b))
- **api:** new method `validateMultipleFiles` ([536be69](https://gitlab.com/html-validate/html-validate/commit/536be69))

## 1.9.1 (2019-09-19)

### Bug Fixes

- **rules:** fix handling of invalid void style ([4682d96](https://gitlab.com/html-validate/html-validate/commit/4682d96)), closes [#52](https://gitlab.com/html-validate/html-validate/issues/52)

# 1.9.0 (2019-09-17)

### Features

- **rules:** new rule `svg-focusable` ([c354364](https://gitlab.com/html-validate/html-validate/commit/c354364))

# 1.8.0 (2019-09-16)

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

## 1.7.1 (2019-09-15)

### Bug Fixes

- **config:** better error message when transformer fails to load ([c5a4f38](https://gitlab.com/html-validate/html-validate/commit/c5a4f38))

# 1.7.0 (2019-09-11)

### Bug Fixes

- **parser:** fix conditional comments pushing elements into tree ([b26fe80](https://gitlab.com/html-validate/html-validate/commit/b26fe80)), closes [#51](https://gitlab.com/html-validate/html-validate/issues/51)
- **rules:** attr-case no longer reports duplicate errors for dynamic attributes ([c06ae67](https://gitlab.com/html-validate/html-validate/commit/c06ae67)), closes [#48](https://gitlab.com/html-validate/html-validate/issues/48)

### Features

- **location:** allow sliceLocation to wrap line/column ([cbd7796](https://gitlab.com/html-validate/html-validate/commit/cbd7796))
- **rules:** add PascalCase and camelCase styles for `attr-case` ([9e91f81](https://gitlab.com/html-validate/html-validate/commit/9e91f81)), closes [#49](https://gitlab.com/html-validate/html-validate/issues/49)

# 1.6.0 (2019-09-01)

### Bug Fixes

- **matchers:** typo in error message ([daeabba](https://gitlab.com/html-validate/html-validate/commit/daeabba))

### Features

- **matchers:** optionally test context ([44fcf47](https://gitlab.com/html-validate/html-validate/commit/44fcf47))

## 1.5.1 (2019-08-20)

### Bug Fixes

- **elements:** mark contextmenu attribute as deprecated ([db4069f](https://gitlab.com/html-validate/html-validate/commit/db4069f))

### Features

- **rules:** new rule no-unknown-elements ([96f5fcf](https://gitlab.com/html-validate/html-validate/commit/96f5fcf))

## 1.5.0 (2019-08-17)

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

## 1.4.0 (2019-08-15)

### Bug Fixes

- **deps:** update dependency acorn-walk to v7 ([1fe89e0](https://gitlab.com/html-validate/html-validate/commit/1fe89e0))
- **reporter:** fix {error,warning}Count after merging reports ([bc657d0](https://gitlab.com/html-validate/html-validate/commit/bc657d0))
- **reporter:** require {error,warning}Count to be present in Result ([b1306a4](https://gitlab.com/html-validate/html-validate/commit/b1306a4))

### Features

- **cli:** add new --max-warnings flag ([e78a1dc](https://gitlab.com/html-validate/html-validate/commit/e78a1dc))
- **reporter:** add {error,warning}Count summary to Report object ([2bae1d0](https://gitlab.com/html-validate/html-validate/commit/2bae1d0))

# 1.3.0 (2019-08-12)

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
  suppresses the notice about internal error which should be reported as a bug.
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
- attach `depth` and `unique` read-only properties to `DOMNode` corresponding to
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
