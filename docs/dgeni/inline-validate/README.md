# Inline HTML-validate results

Processes the markup inside the tag and runs HTML-Validate on it.
If there are any errors they will be printed using `codeframe` formatter.

Jest snapshot tests will also be generated for each validation to ensure changes to documentation validations will be consistent with intended changes.

```html
<validate name="document-unique-name">
  <!-- my markup -->
</validate>
```

## Usage

The following attributes can be set:

- `name` - a per-document unique name.
- `rules` - a whitespace-separated list of rules to enable. Default: all rules from recommended list
- `elements` - path to custom metadata (relative to current file). Default: `html5`
- `results` - set to `true` to force validation results to show up even if it is 0. Default `auto`.

Rule options can be set by using the rule name as attribute and providing a JSON-encoded string with options.
