# `@html-validate/rollup-plugin-legacy

A plugin to handle legacy compatibility.

For typescript tooling not respecting the `exports` field it writes a reexporting stub in the output folder pointing to the proper file, e.g. `dist/${format}/foo.d.ts` containing `export * from "../types/foo"`.
