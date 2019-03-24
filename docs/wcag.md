@ngdoc content
@module frontpage
@name WCAG 2.1 support table
@description

# WCAG 2.1 support table

## HTML Techniques

The validator supports rules which can be validated without understanding the
textual description of the content. E.g. it cannot suggest to use `<abbr>` or
`<dl>` where appropriate or similar when to use the `lang` or `dir` attributes.

<div class="markdown-table table-striped table-hover support-table"></div>

| Technique | Description                                                                                                                                    |                       Support                        |
| --------: | ---------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------: |
|        H2 | Combining adjacent image and text links for the same resource                                                                                  |          <span class="support-no">No</span>          |
|        H4 | Creating a logical tab order through links, form controls, and objects                                                                         |          <span class="support-no">No</span>          |
|       H24 | Providing text alternatives for the area elements of image maps                                                                                |     <span class="support-planned">Planned</span>     |
|       H25 | Providing a title using the title element                                                                                                      |         <span class="support-yes">Yes</span>         |
|       H28 | Providing definitions for abbreviations by using the abbr element                                                                              |          <span class="support-no">No</span>          |
|       H30 | Providing link text that describes the purpose of a link for anchor elements                                                                   |     <span class="support-planned">Planned</span>     |
|       H32 | Providing submit buttons                                                                                                                       |         <span class="support-yes">Yes</span>         |
|       H33 | Supplementing link text with the title attribute                                                                                               |          <span class="support-no">No</span>          |
|       H34 | Using a Unicode right-to-left mark (RLM) or left-to-right mark (LRM) to mix text direction inline                                              |          <span class="support-no">No</span>          |
|       H35 | Providing text alternatives on applet elements                                                                                                 |     <span class="support-planned">Planned</span>     |
|       H36 | Using alt attributes on images used as submit buttons                                                                                          |     <span class="support-planned">Planned</span>     |
|       H37 | Using alt attributes on img elements                                                                                                           |         <span class="support-yes">Yes</span>         |
|       H39 | Using caption elements to associate data table captions with data tables                                                                       |     <span class="support-planned">Planned</span>     |
|       H40 | Using description lists                                                                                                                        |          <span class="support-no">No</span>          |
|       H42 | Using h1-h6 to identify headings                                                                                                               |          <span class="support-no">No</span>          |
|       H43 | Using id and headers attributes to associate data cells with header cells in data tables                                                       |          <span class="support-no">No</span>          |
|       H44 | Using label elements to associate text labels with form controls                                                                               |         <span class="support-yes">Yes</span>         |
|       H45 | Using longdesc                                                                                                                                 |          <span class="support-no">No</span>          |
|       H46 | Using noembed with embed                                                                                                                       |     <span class="support-planned">Planned</span>     |
|       H48 | Using ol, ul and dl for lists or groups of links                                                                                               |          <span class="support-no">No</span>          |
|       H49 | Using semantic markup to mark emphasized or special text                                                                                       |          <span class="support-no">No</span>          |
|       H51 | Using table markup to present tabular information                                                                                              |          <span class="support-no">No</span>          |
|       H53 | Using the body of the object element                                                                                                           |     <span class="support-planned">Planned</span>     |
|       H54 | Using the dfn element to identify the defining instance of a word                                                                              |          <span class="support-no">No</span>          |
|       H56 | Using the dir attribute on an inline element to resolve problems with nested directional runs                                                  |          <span class="support-no">No</span>          |
|       H57 | Using language attributes on the html element                                                                                                  |         <span class="support-yes">Yes</span>         |
|       H58 | Using language attributes to identify changes in the human language                                                                            |          <span class="support-no">No</span>          |
|       H59 | Using the link element and navigation tools                                                                                                    |          <span class="support-no">No</span>          |
|       H60 | Using the link element to link to a glossary                                                                                                   |          <span class="support-no">No</span>          |
|       H62 | Using the ruby element                                                                                                                         |          <span class="support-no">No</span>          |
|       H63 | Using the scope attribute to associate header cells and data cells in data tables                                                              |         <span class="support-yes">Yes</span>         |
|       H64 | Using the title attribute of the frame and iframe elements                                                                                     |         <span class="support-yes">Yes</span>         |
|       H65 | Using the title attribute to identify form controls when the label element cannot be used                                                      |     <span class="support-planned">Planned</span>     |
|       H67 | Using null alt text and no title attribute on img elements for images that AT should ignore                                                    |         <span class="support-yes">Yes</span>         |
|       H69 | Providing heading elements at the beginning of each section of content                                                                         |     <span class="support-planned">Planned</span>     |
|       H70 | Using frame elements to group blocks of repeated material                                                                                      |          <span class="support-no">No</span>          |
|       H71 | Providing a description for groups of form controls using fieldset and legend elements                                                         | <span class="support-planned">Partial planned</span> |
|       H73 | Using the summary attribute of the table element to give an overview of data tables                                                            |     <span class="support-planned">Planned</span>     |
|       H74 | Ensuring that opening and closing tags are used according to specification                                                                     |         <span class="support-yes">Yes</span>         |
|       H75 | Ensuring that Web pages are well-formed                                                                                                        |         <span class="support-yes">Yes</span>         |
|       H76 | Using meta refresh to create an instant client-side redirect                                                                                   |     <span class="support-planned">Planned</span>     |
|       H77 | Identifying the purpose of a link using link text combined with its enclosing list item                                                        |          <span class="support-no">No</span>          |
|       H78 | Identifying the purpose of a link using link text combined with its enclosing paragraph                                                        |          <span class="support-no">No</span>          |
|       H79 | Identifying the purpose of a link in a data table using the link text combined with its enclosing table cell and associated table header cells |          <span class="support-no">No</span>          |
|       H80 | Identifying the purpose of a link using link text combined with the preceding heading element                                                  |          <span class="support-no">No</span>          |
|       H81 | Identifying the purpose of a link in a nested list using link text combined with the parent list item under which the list is nested           |          <span class="support-no">No</span>          |
|       H83 | Using the target attribute to open a new window on user request and indicating this in link text                                               |          <span class="support-no">No</span>          |
|       H84 | Using a button with a select element to perform an action                                                                                      |          <span class="support-no">No</span>          |
|       H85 | Using OPTGROUP to group OPTION elements inside a SELECT                                                                                        |          <span class="support-no">No</span>          |
|       H86 | Providing text alternatives for ASCII art, emoticons, and leetspeak                                                                            | <span class="support-planned">Partial planned</span> |
|       H88 | Using HTML according to spec                                                                                                                   |         <span class="support-yes">Yes</span>         |
|       H89 | Using the title attribute to provide context-sensitive help                                                                                    |          <span class="support-no">No</span>          |
|       H90 | Indicating required form controls using label or legend                                                                                        |     <span class="support-planned">Planned</span>     |
|       H91 | Using HTML form controls and links                                                                                                             |     <span class="support-planned">Planned</span>     |
|       H93 | Ensuring that id attributes are unique on a Web page                                                                                           |         <span class="support-yes">Yes</span>         |
|       H94 | Ensuring that elements do not contain duplicate attributes                                                                                     |         <span class="support-yes">Yes</span>         |
|       H95 | Using the track element to provide captions                                                                                                    |     <span class="support-planned">Planned</span>     |
|       H96 | Using the track element to provide audio descriptions                                                                                          |     <span class="support-planned">Planned</span>     |
|       H97 | Grouping related links using the nav element                                                                                                   |          <span class="support-no">No</span>          |
|       H98 | Using HTML 5.2 autocomplete attributes                                                                                                         |     <span class="support-planned">Planned</span>     |
