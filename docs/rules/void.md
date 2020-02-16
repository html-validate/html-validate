---
docType: rule
name: void
category: style
summary: Disallow void element with content
---

# disallows void element with content (`void`)

HTML [void elements](https://www.w3.org/TR/html5/syntax.html#void-elements)
cannot have any content and must not have an end tag.

Foreign elements will always be ignored by this rule.

**Deprecated:** This rule is deprecated. It has been replaced by the rules {@link void-content}, {@link void-style} and {@link no-self-closing}.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="void">
    <fieldset>
        <input/>
    </fieldset>

    <img></img>

</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="void">
    <fieldset>
        <input>
    </fieldset>

    <img>

</validate>

## Options

This rule takes an optional object:

```javascript
{
	"style": "omit",
}
```

### Style

- `omit` requires end tag to be omitted and disallows self-closing
  elements (default).
- `selfclose` requests self-closing any void element.
- `any` allows both omitting and self-closing elements.
