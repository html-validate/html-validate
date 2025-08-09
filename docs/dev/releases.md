---
docType: content
title: Release and support plan
nav: devguide
---

# Release and support plan

## HTML-Validate

Older major versions is generally supported for two year after the succeeding version.

<table class="table release-table">
  <thead>
    <tr>
      <th scope="col">Major</th>
      <th scope="col">Status</th>
      <th scope="col">Initial release</th>
      <th scope="col">Support end</th>
    </tr>
  </thead>
  <tbody>
    <tr class="release-active">
      <td>9.x</td>
      <td>Active</td>
      <td>2024-12-23</td>
      <td>-</td>
    </tr>
    <tr class="release-active">
      <td>8.x</td>
      <td>Active</td>
      <td>2023-06-04</td>
      <td>2026-12-31</td>
    </tr>
    <tr class="release-eol">
      <td>7.x</td>
      <td>End of Life</td>
      <td>2022-05-06</td>
      <td>2024-06-31</td>
    </tr>
    <tr class="release-eol">
      <td>6.x</td>
      <td>End of Life</td>
      <td>2021-09-26</td>
      <td>2024-05-31</td>
    </tr>
    <tr class="release-eol">
      <td>5.x</td>
      <td>End of Life</td>
      <td>2021-06-26</td>
      <td>2023-09-31</td>
    </tr>
    <tr class="release-eol">
      <td>4.x</td>
      <td>End of Life</td>
      <td>2020-11-07</td>
      <td>2022-06-31</td>
    </tr>
  </tbody>
</table>

Maintenance versions will be supported by official plugins and will receive critical bugfixes.

It is strongly recommended to stay up-to-date with latest releases.

## NodeJS

HTML-Validate and all official plugins supports all current, active and maintenance versions.
Support for pending versions is limited but reporting bugs against pending versions are encountered.

## Third party frameworks and tools

HTML-Validate and all official plugins will generally support the last three major versions or at least each major for a year.
Some exceptions occur, refer to the following table:

<table class="table table-striped">
  <thead>
    <tr>
      <th scope="col">Libraries</th>
      <th scope="col">Current versions</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jest</td>
      <td><code>28 || 29 || 30</code></td>
      <td>Last 3 majors</td>
    </tr>
    <tr>
      <td>Cypress</td>
      <td><code>11 || 12 || 13 || 14</code></td>
      <td>Last 3 majors</td>
    </tr>
    <tr>
      <td>Vitest</td>
      <td><code>v1.x || v2.x || v3.x</code></td>
      <td>Last 3 majors</td>
    </tr>
    <tr>
      <td>Vue 2.x</td>
      <td><code>2.x</code></td>
      <td>Vue v2 will be supported until further notice</td>
    </tr>
    <tr>
      <td>Vue 3.x</td>
      <td><code>3.x</code></td>
      <td>Vue v3 will be supported until further notice</td>
    </tr>
    <tr>
      <td>VSCode</td>
      <td>-</td>
      <td>VSCode releases dating one year back will be supported.</td>
    </tr>
    <tr>
      <td>AngularJS</td>
      <td><code>1.x</code></td>
      <td>AngularJS v1.x will be supported until further notice</td>
    </tr>
    <tr>
      <td>Grunt</td>
      <td><code>1.x</code></td>
      <td>Grunt v1.x will be supported until further notice</td>
    </tr>
    <tr>
      <td>Protractor</td>
      <td><code>7</code></td>
      <td>Protractor v7.x will be supported until Protractor reaches EOL</td>
    </tr>
  </tbody>
</table>
