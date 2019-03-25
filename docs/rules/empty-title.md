@ngdoc rule
@module rules
@name empty-title
@category a17y
@summary Require title to have textual content
@description

# require title to have textual content (`empty-title`)

The `<title>` element is used to describe the document and is shown in the
browser tab and titlebar. The content cannot be whitespace only.

WCAG ([H25][wcag-h25]) and SEO requires a descriptive title and preferably
unique within the site. For SEO a maximum of around 60-70 characters is
recommended.

Each title should make sense on its own and properly describe the
document. Avoid keyword stuffing.

See also [WCAG G88: Providing descriptive titles][wcag-g88].

[wcag-h25]: https://www.w3.org/WAI/WCAG21/Techniques/html/H25
[wcag-g88]: https://www.w3.org/WAI/WCAG21/Techniques/general/G88

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="empty-title">
    <head>
        <title></title>
    </head>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="empty-title">
    <head>
        <title>Lorem ipsum</title>
    </head>
</validate>

## Whitespace

Text with only whitespace is also considered empty.

<validate name="whitespace" rules="empty-title">
    <head>
        <title> </title>
    </head>
</validate>
