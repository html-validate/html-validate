---
docType: content
title: "WCAG 2.2 support table"
nav: false
---

# WCAG 2.2 support table

## HTML Techniques

The validator supports rules which can be validated without understanding the
textual description of the content. E.g. it cannot suggest to use `<abbr>` or
`<dl>` where appropriate or similar when to use the `lang` or `dir` attributes.

<table class="table table-striped support-table">
	<thead>
		<tr>
			<th class="table-right" scope="col">Technique</th>
			<th scope="col">Description</th>
			<th class="table-center" scope="col">Support</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="table-right">H2</td>
			<td>Combining adjacent image and text links for the same resource</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H4</td>
			<td>Creating a logical tab order through links, form controls, and objects</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H24</td>
			<td>
				Providing text alternatives for the area elements of image maps.
				<em> Use {@link rule:area-alt} to validate. Only checks for presence of text. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H25</td>
			<td>Providing a title using the title element</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H28</td>
			<td>Providing definitions for abbreviations by using the abbr element</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H30</td>
			<td>
				Providing link text that describes the purpose of a link for anchor elements.
				<em> Use {@link rule:wcag/h30} to validate. Only checks for presence of text. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H32</td>
			<td>
				Providing submit buttons.
				<em> Use {@link rule:wcag/h32} to validate. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H33</td>
			<td>Supplementing link text with the title attribute</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H34</td>
			<td>
				Using a Unicode right-to-left mark (RLM) or left-to-right mark (LRM) to mix text direction
				inline
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H35</td>
			<td>Providing text alternatives on applet elements</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H36</td>
			<td>
				Using alt attributes on images used as submit buttons.
				<em> Use {@link rule:wcag/h36} to validate. Only checks for presence of text. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H37</td>
			<td>
				Using alt attributes on img elements.
				<em>
					Use {@link rule:wcag/h37} to validate. Only checks for presence of text or explicit
					<code>alt=""</code> for decorative images.
				</em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H39</td>
			<td>Using caption elements to associate data table captions with data tables</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H40</td>
			<td>Using description lists</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H42</td>
			<td>Using h1-h6 to identify headings</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H43</td>
			<td>
				Using id and headers attributes to associate data cells with header cells in data tables
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H44</td>
			<td>
				Using label elements to associate text labels with form controls.
				<em>
					Use {@link rule:input-missing-label} to validate. Rule is only enabled by default in
					document mode (<code>html-validate:document</code>).
				</em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H45</td>
			<td>Using longdesc</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H46</td>
			<td>Using noembed with embed</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H48</td>
			<td>Using ol, ul and dl for lists or groups of links</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H49</td>
			<td>Using semantic markup to mark emphasized or special text</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H51</td>
			<td>Using table markup to present tabular information</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H53</td>
			<td>Using the body of the object element</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H54</td>
			<td>Using the dfn element to identify the defining instance of a word</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H56</td>
			<td>
				Using the dir attribute on an inline element to resolve problems with nested directional
				runs
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H57</td>
			<td>
				Using language attributes on the html element.
				<em>
					Use {@link rule:element-required-attributes} to validate. <code>lang</code> is a required
					attribute on <code>&lt;html&gt;</code> elements.
				</em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H58</td>
			<td>Using language attributes to identify changes in the human language</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H59</td>
			<td>Using the link element and navigation tools</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H60</td>
			<td>Using the link element to link to a glossary</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H62</td>
			<td>Using the ruby element</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H63</td>
			<td>
				Using the scope attribute to associate header cells and data cells in data tables.
				<em> Use {@link rule:wcag/h63} to validate. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H64</td>
			<td>
				Using the title attribute of the frame and iframe elements.
				<em>
					Use {@link rule:element-required-attributes} to validate. <code>title</code> is a required
					attribute on <code>&lt;frame&gt;</code> and <code>&lt;iframe&gt;</code> elements.
				</em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H65</td>
			<td>
				Using the title attribute to identify form controls when the label element cannot be used
			</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H67</td>
			<td>
				Using null alt text and no title attribute on img elements for images that AT should ignore.
				<em> Use {@link rule:wcag/h67} to validate. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H69</td>
			<td>Providing heading elements at the beginning of each section of content</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H70</td>
			<td>Using frame elements to group blocks of repeated material</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H71</td>
			<td>
				Providing a description for groups of form controls using fieldset and legend elements.
				<em>
					Use {@link rule:wcag/h71} to validate presence of <code>&lt;legend&gt;</code> inside
					<code>&lt;fieldset&gt;</code> but it will not validate if
					<code>&lt;fieldset&gt;</code> itself is used.
				</em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H73</td>
			<td>Using the summary attribute of the table element to give an overview of data tables</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H74</td>
			<td>
				Ensuring that opening and closing tags are used according to specification.
				<em> Use {@link rule:close-order} and {@link rule:void-content} to validate. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H75</td>
			<td>
				Ensuring that Web pages are well-formed.
				<em> Non-well-formed pages will cause parser errors which cannot be ignored. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H76</td>
			<td>
				Using meta refresh to create an instant client-side redirect.
				<em> Use {@link rule:meta-refresh} to validate. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H77</td>
			<td>
				Identifying the purpose of a link using link text combined with its enclosing list item
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H78</td>
			<td>
				Identifying the purpose of a link using link text combined with its enclosing paragraph
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H79</td>
			<td>
				Identifying the purpose of a link in a data table using the link text combined with its
				enclosing table cell and associated table header cells
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H80</td>
			<td>
				Identifying the purpose of a link using link text combined with the preceding heading
				element
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H81</td>
			<td>
				Identifying the purpose of a link in a nested list using link text combined with the parent
				list item under which the list is nested
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H83</td>
			<td>
				Using the target attribute to open a new window on user request and indicating this in link
				text
			</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H84</td>
			<td>Using a button with a select element to perform an action</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H85</td>
			<td>Using OPTGROUP to group OPTION elements inside a SELECT</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H86</td>
			<td>Providing text alternatives for ASCII art, emoticons, and leetspeak</td>
			<td class="support-planned">Partial planned</td>
		</tr>
		<tr>
			<td class="table-right">H88</td>
			<td>
				Using HTML according to spec.
				<em> Use the content model rules to validate. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H89</td>
			<td>Using the title attribute to provide context-sensitive help</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H90</td>
			<td>Indicating required form controls using label or legend</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H91</td>
			<td>Using HTML form controls and links</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H93</td>
			<td>
				Ensuring that id attributes are unique on a Web page.
				<em> Use {@link rule:no-dup-id} to validate, preferably in document mode. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H94</td>
			<td>
				Ensuring that elements do not contain duplicate attributes.
				<em> Use {@link rule:no-dup-attr} to validate. </em>
			</td>
			<td class="support-yes">Yes</td>
		</tr>
		<tr>
			<td class="table-right">H95</td>
			<td>Using the track element to provide captions</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H96</td>
			<td>Using the track element to provide audio descriptions</td>
			<td class="support-planned">Planned</td>
		</tr>
		<tr>
			<td class="table-right">H97</td>
			<td>Grouping related links using the nav element</td>
			<td class="support-no">No</td>
		</tr>
		<tr>
			<td class="table-right">H98</td>
			<td>Using HTML 5.2 autocomplete attributes</td>
			<td class="support-planned">Planned</td>
		</tr>
	</tbody>
</table>
