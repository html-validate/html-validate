@ngdoc content
@name Using CLI
@description

# Using the Command Line Interface

The html-validate CLI can be installed with npm:

    npm i -g html-validate

To run html-validate use:

    html-validate [OPTIONS] [FILE|DIR|GLOB...]

Since globs will usually be expanded by your shell remember to quote the pattern if you require node `glob` syntax:

    html-validate "src/**/*.html"

## Options

### `--ext`

This option specifies the file extensions to use when searching for files in directories.
By default only `.html` files are searched.
This option is ignored when specifying files or globs.

Multiple extensions can be set with a comma-separated list: `--ext html,vue`.
Leading dots are ignored.

    html-validate --ext html,vue src

### `-f`, `--formatter`

Specify which formatter(s) to use.
Possible formats are:

- checkstyle
- codeframe
- json
- stylish
- text

Multiples formatters can be set with a comma-separated list: `--formatter stylish,checkstyle`.
Output can be redirected to a file using `name=path`: `--formatter checkstyle=result.xml`.

    html-validate --formatter stylish file.html

### `--max-warnings`

Exits with non-zero status if more when more than given amount of warnings occurs.
Use `0` to disallow warnings.

    html-validate --max-warnings 0 file.html

### `--rule`

Inline rule configuration.

    html-validate --rule void:2 file.html

Note: rules replaces existing configuration!

### `--stdin`

Process markup from stdin.
The special alias `-` can also be set as a filename to use stdin.

```bash
curl http://example.net | html-validate --stdin
```

### `--stdin-filename`

Filename to set in report when using `--stdin`.

```bash
curl http://example.net | html-validate --stdin --stdin-filename example.net
```

## Debugging options

The options are intended for debugging purposes.

### `--dump-events`

Instead of validating file print the event stream generated.

    html-validate --dump-events file.html

### `--dump-tokens`

Instead of validating file print the token stream generated.

    html-validate --dump-token file.html

### `--dump-tree`

Instead of validating file print the DOM tree generated.

    html-validate --dump-tree file.html

## Miscellaneous options

### `-c`, `--config`

Specify a different configuration file.

    html-validate --config myconfig.json file.html

Note that specifying a separate configuration file changes the default
configuration but `.htmlvalidate.json` files will still be searched from the
filesystem. Set the `root` property to `true` to prevent this behaviour:

```js
{
  "root": true
}
```

### `--init`

Initialize project with a new configuration.

    html-validate --init

The new configuration will be written to the current directory (in
`.htmlvalidate.json`).

### `--print-config`

Instead of validating file print the configuration generated.

### `-h`, `--help`

Show help.

### `--version`

Show version number
