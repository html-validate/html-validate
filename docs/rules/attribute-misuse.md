---
docType: rule
name: attribute-misuse
category: content-model
summary: Require attribute to be used in correct context
standards:
  - html5
---

# Require attribute to be used in correct context

Some attributes have usage requirements, for instance:

- `<a target>` requires the `href` attribute.
- `<button formaction>` requires `type="submit"`.
- `<meta content>` requires one of the `name`, `http-equiv` or `itemprop` attributes.
- `<meta>` can only contain one of the `name`, `http-equiv` or `itemprop` attributes.
- `<meta name>` requires the `content` attribute.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="attribute-misuse">
    <a target="_blank">
    <button type="button" formaction="post">
    <meta name=".." http-equiv="..">
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="attribute-misuse">
    <a href=".." target="_blank">
    <button type="submit" formaction="post">
    <meta name=".." content="..">
    <meta http-equiv=".." content="..">
</validate>

## Version history

- 7.7.0 - Rule added.
