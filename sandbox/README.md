# Sandbox

Sandbox area for testing and reproducing bugs and issues.
Everything here except this file and `html-validate.config.mjs` is local-only: `*.html` files and `html-validate.local.mjs` are gitignored, and `*.html` is excluded from prettier.

## Usage

The CLI auto-detects `html-validate.config.mjs` by searching upwards from the current directory, so run it from this folder:

```bash
cd sandbox
cat > test.html <<'EOF'
<p>asdf <div>bsdf</div> </p>
EOF
npx html-validate test.html
```

Note: the project must be built (`npm run build`) before validating files in the sandbox.

## Configuration

- `html-validate.config.mjs` is the base configuration (HTML5 elements and the `html-validate:recommended` preset for `*.html`). Leave it intact.
- `html-validate.local.mjs` is your own configuration. It is optional, gitignored, and loaded after the base so it can override it. Export a flat config object or an array of them:

  ```ts
  export default [
    {
      rules: {
        "no-unknown-attributes": "error",
      },
    },
  ];
  ```

If the local file is missing the base configuration is used as-is.
Errors inside the local file (syntax errors, failing imports) are reported rather than ignored.
