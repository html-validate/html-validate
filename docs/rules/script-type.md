---
docType: rule
name: script-type
category: syntax
summary: Require valid type for `<script>` element
standards:
  - html5
---

# Require valid type for `<script>` element

The [HTML5 standard encourages][spec] omitting the `type` attribute when the script is a JavaScript resource and only use it to specify `module` or other non-javascript MIME types.

[spec]: https://html.spec.whatwg.org/multipage/scripting.html#attr-script-type

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="script-type">
<script type=""></script>
<script type="text/javascript"></script>
<script type="application/javascript"></script>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="script-type">
    <script></script>
    <script type="module"></script>
    <script type="text/plain"></script>
    <script type="text/x-custom"></script>
</validate>
