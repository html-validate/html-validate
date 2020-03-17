---
docType: content
title: Writing custom element metadata - Resticting element attributes
---

# Writing custom element metadata: Restricting element attributes

Similar to {@link guide/metadata/restrict-content restricting content} restricting attributes comes in a few different versions.
To define what values attribute accept the `attributes` property is used, to define what attributes are required use `requiredAttributes` and to mark an attribute as deprecated use `deprecatedAttributes`.

## Define attribute values

Assuming our `<my-component>` element has a `duck` attribute which can take the value `huey`, `dewey` or `louie` we can use the `attributes` property to define an enumerated list of allowed values:

```json
{
  "my-component": {
    "flow": true,
    "attributes": {
      "duck": {
        "enum": ["huey", "dewey", "louie"]
      }
    }
  }
}
```

<validate name="enum" elements="restrict-attributes-enum.json">
  <my-component duck="dewey">...</my-component>
  <my-component duck="flintheart">...</my-component>
</validate>

We can also specify regular expressions by surrounding the string with `/` (remember to escape special characters properly):

```json
{
  "my-component": {
    "flow": true,
    "attributes": {
      "ducks": {
        "enum": ["/\\d+/"]
      }
    }
  }
}
```

<validate name="regexp" elements="restrict-attributes-regexp.json">
  <my-component ducks="3">...</my-component>
  <my-component ducks="huey">...</my-component>
</validate>

<div class="alert alert-info">
	<i class="fa fa-info-circle" aria-hidden="true"></i>
	<strong>Tips</strong>
	<ul>
		<li>Regular expressions and enumeration can be used at the same time.</li>
		<li>The empty string <code>""</code> is also valid and means that the value must be empty, e.g. <code>ducks=""</code></li>
	</ul>
</div>

To force a boolean value similar to `disabled`, `selected` etc instead set the `boolean` property to `true`.

```json
{
  "my-component": {
    "flow": true,
    "attributes": {
      "quacks": {
        "boolean": true
      }
    }
  }
}
```

<validate name="boolean" elements="restrict-attributes-boolean.json">
  <my-component quacks>...</my-component>
  <my-component quacks="duck">...</my-component>
</validate>

## Define required attributes

Required attributes (attributes that must be set on an element) can be specified by setting `required` to `true`:

```json
{
  "my-component": {
    "flow": true,
    "attributes": {
      "duck": {
        "required": true
      }
    }
  }
}
```

<validate name="required" elements="restrict-attributes-required.json">
  <my-component duck="dewey">...</my-component>
  <my-component>...</my-component>
</validate>

## Deprecating attributes

Similar to required attribute we can set `deprecated` to true or a message to mark an attribute as deprecated:

```json
{
  "my-component": {
    "flow": true,
    "attributes": {
      "duck": {
        "deprecated": true
      }
    }
  }
}
```

<validate name="deprecated" elements="restrict-attributes-deprecated.json">
  <my-component duck="dewey">...</my-component>
  <my-component>...</my-component>
</validate>
