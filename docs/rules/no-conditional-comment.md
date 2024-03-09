---
docType: rule
name: no-conditional-comment
category: deprecated
summary: Disallow usage of conditional comments
---

# Disallow usage of conditional comments

Microsoft Internet Explorer previously supported using special HTML comments
([conditional comments][1]) for targeting specific versions of IE but since IE
10 it is deprecated and not supported in standards mode.

[1]: https://msdn.microsoft.com/en-us/library/ms537512(v=vs.85).aspx

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="no-conditional-comment">
    <!--[if IE]>
    <p>You are using Internet Explorer.</p>
    <![endif]-->

    <![if !IE]>
    <p>You are not using Internet Explorer.</p>
    <![endif]>

</validate>
