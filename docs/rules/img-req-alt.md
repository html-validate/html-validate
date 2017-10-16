# requires images to have alt text (`img-req-alt`)

Both [HTML5][1] and [WCAG 2.0][2] requires images to have a alternative text for
each image.

[1]: https://html.spec.whatwg.org/#alt
[2]: https://www.w3.org/TR/WCAG20-TECHS/H37.html

## Rule details

Examples of **incorrect** code for this rule:

```html
<img>
```

Examples of **correct** code for this rule:

```html
<img alt="...">
```

## Options

This rule takes an optional object:

```javascript
{
	"allowEmpty": true,
	"alias": []
}
```

### allow empty

Sometimes images are used in context where the image only adds to the user
experience but is already clear from an A17Y perspective.

When `true` this allows empty `<img alt="">` to be used to prevent errors and to
signal that the image is not ment to be read.

Examples of **correct** code for this rule:

```html
<span>The task was successfully completed! <img src="thumbsup.png" alt=""></span>
```

### alias

If javascript is used to set the attribute on-the-fly (e.g. using
`angular-translate`) the alternative attributes can be listed here.

Examples of **correct** code when `alias` is `["data-alt"]`:

```html
<img data-alt="...">
```
