/**
 * Conformance tests for "ARIA in HTML" specification
 * https://www.w3.org/TR/html-aria
 */

import { Source } from "../../context";
import { HtmlElement } from "../../dom";
import { HtmlValidate } from "../../htmlvalidate";

interface ImplicitARIARole {
	description: string;
	markup: string;
	selector: string;
	role: string | null;
}

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: ["html-validate:recommended"],
	elements: ["html5"],
});

async function getElement(markup: string, selector: string): Promise<HtmlElement | null> {
	const source: Source = {
		data: markup,
		filename: "inline",
		line: 1,
		column: 1,
		offset: 0,
	};
	const parser = await htmlvalidate.getParserFor(source);
	const doc = parser.parseHtml(source.data);
	return doc.querySelector(selector);
}

async function implicitRole(markup: string, selector: string): Promise<string | null> {
	const element = await getElement(markup, selector);
	if (!element) {
		return null;
	}
	const meta = element.meta!;
	return meta.implicitRole(element._adapter);
}

describe("§4 Implicit ARIA Semantics", () => {
	/**
	 * Scraped  from specification on 2023-09-09.
	 *
	 * Elements with [prohibited roles](wai-aria] such as "generic" is ignored as
	 * they cannot be specified by the author.
	 *
	 * [wai-aria]: https://www.w3.org/TR/wai-aria-1.2/#namefromprohibited
	 */
	const specification: ImplicitARIARole[] = [
		{
			description: `a`,
			markup: /* HTML */ ` <a></a> `,
			selector: `a`,
			role: null,
		},

		{
			description: `a[href]`,
			markup: /* HTML */ ` <a href></a> `,
			selector: `a`,
			role: `link`,
		},

		{
			description: `address`,
			markup: /* HTML */ ` <address></address> `,
			selector: `address`,
			role: `group`,
		},

		{
			description: `area`,
			markup: /* HTML */ ` <area /> `,
			selector: `area`,
			role: null,
		},

		{
			description: `area[href]`,
			markup: /* HTML */ ` <area href /> `,
			selector: `area`,
			role: `link`,
		},

		{
			description: `article`,
			markup: /* HTML */ ` <article></article> `,
			selector: `article`,
			role: `article`,
		},

		{
			description: `aside`,
			markup: /* HTML */ ` <aside></aside> `,
			selector: `aside`,
			role: `complementary`,
		},

		{
			description: `blockquote`,
			markup: /* HTML */ ` <blockquote></blockquote> `,
			selector: `blockquote`,
			role: `blockquote`,
		},

		{
			description: `button`,
			markup: /* HTML */ ` <button></button> `,
			selector: `button`,
			role: `button`,
		},

		{
			description: `datalist`,
			markup: /* HTML */ ` <datalist></datalist> `,
			selector: `datalist`,
			role: `listbox`,
		},

		{
			description: `details`,
			markup: /* HTML */ ` <details></details> `,
			selector: `details`,
			role: `group`,
		},

		{
			description: `dfn`,
			markup: /* HTML */ ` <dfn></dfn> `,
			selector: `dfn`,
			role: `term`,
		},

		{
			description: `dialog`,
			markup: /* HTML */ ` <dialog></dialog> `,
			selector: `dialog`,
			role: `dialog`,
		},

		{
			description: `fieldset`,
			markup: /* HTML */ ` <fieldset></fieldset> `,
			selector: `fieldset`,
			role: `group`,
		},

		{
			description: `figure`,
			markup: /* HTML */ ` <figure></figure> `,
			selector: `figure`,
			role: `figure`,
		},

		{
			description: `footer`,
			markup: /* HTML */ ` <footer></footer> `,
			selector: `footer`,
			role: `contentinfo`,
		},

		{
			description: `article footer`,
			markup: /* HTML */ ` <article><footer></footer></article> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `aside footer`,
			markup: /* HTML */ ` <aside><footer></footer></aside> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `main footer`,
			markup: /* HTML */ ` <main><footer></footer></main> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `nav footer`,
			markup: /* HTML */ ` <nav><footer></footer></nav> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `section footer`,
			markup: /* HTML */ ` <section><footer></footer></section> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `[role=article] footer`,
			markup: /* HTML */ ` <div role="article"><footer></footer></div> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `[role=complementary] footer`,
			markup: /* HTML */ ` <div role="complementary"><footer></footer></div> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `[role=main] footer`,
			markup: /* HTML */ ` <div role="main"><footer></footer></div> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `[role=navigation] footer`,
			markup: /* HTML */ ` <div role="navigation"><footer></footer></div> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `[role=region] footer`,
			markup: /* HTML */ ` <div role="region"><footer></footer></div> `,
			selector: `footer`,
			role: null,
		},

		{
			description: `form`,
			markup: /* HTML */ ` <form></form> `,
			selector: `form`,
			role: `form`,
		},

		{
			description: `h1`,
			markup: /* HTML */ ` <h1></h1> `,
			selector: `h1`,
			role: `heading`,
		},

		{
			description: `h2`,
			markup: /* HTML */ ` <h2></h2> `,
			selector: `h2`,
			role: `heading`,
		},

		{
			description: `h3`,
			markup: /* HTML */ ` <h3></h3> `,
			selector: `h3`,
			role: `heading`,
		},

		{
			description: `h4`,
			markup: /* HTML */ ` <h4></h4> `,
			selector: `h4`,
			role: `heading`,
		},

		{
			description: `h5`,
			markup: /* HTML */ ` <h5></h5> `,
			selector: `h5`,
			role: `heading`,
		},

		{
			description: `h6`,
			markup: /* HTML */ ` <h6></h6> `,
			selector: `h6`,
			role: `heading`,
		},

		{
			description: `header`,
			markup: /* HTML */ ` <header></header> `,
			selector: `header`,
			role: `banner`,
		},

		{
			description: `article header`,
			markup: /* HTML */ ` <article><header></header></article> `,
			selector: `header`,
			role: null,
		},

		{
			description: `aside header`,
			markup: /* HTML */ ` <aside><header></header></aside> `,
			selector: `header`,
			role: null,
		},

		{
			description: `main header`,
			markup: /* HTML */ ` <main><header></header></main> `,
			selector: `header`,
			role: null,
		},

		{
			description: `nav header`,
			markup: /* HTML */ ` <nav><header></header></nav> `,
			selector: `header`,
			role: null,
		},

		{
			description: `section header`,
			markup: /* HTML */ ` <section><header></header></section> `,
			selector: `header`,
			role: null,
		},

		{
			description: `[role=article] header`,
			markup: /* HTML */ ` <div role="article"><header></header></div> `,
			selector: `header`,
			role: null,
		},

		{
			description: `[role=complementary] header`,
			markup: /* HTML */ ` <div role="complementary"><header></header></div> `,
			selector: `header`,
			role: null,
		},

		{
			description: `[role=main] header`,
			markup: /* HTML */ ` <div role="main"><header></header></div> `,
			selector: `header`,
			role: null,
		},

		{
			description: `[role=navigation] header`,
			markup: /* HTML */ ` <div role="navigation"><header></header></div> `,
			selector: `header`,
			role: null,
		},

		{
			description: `[role=region] header`,
			markup: /* HTML */ ` <div role="region"><header></header></div> `,
			selector: `header`,
			role: null,
		},

		{ description: `hr`, markup: /* HTML */ ` <hr></hr> `, selector: `hr`, role: `separator` },

		{
			description: `html`,
			markup: /* HTML */ ` <html></html> `,
			selector: `html`,
			role: `document`,
		},

		{
			description: `img`,
			markup: /* HTML */ ` <img /> `,
			selector: `img`,
			role: `img`,
		},

		{
			description: `img[alt]`,
			markup: /* HTML */ ` <img alt=".." /> `,
			selector: `img`,
			role: `img`,
		},

		{
			description: `img[alt=""]`,
			markup: /* HTML */ ` <img alt="" /> `,
			selector: `img`,
			role: `presentation`,
		},

		{
			description: `input[type=button]`,
			markup: /* HTML */ ` <input type="button" /> `,
			selector: `input`,
			role: `button`,
		},

		{
			description: `input[type=checkbox]`,
			markup: /* HTML */ ` <input type="checkbox" /> `,
			selector: `input`,
			role: `checkbox`,
		},

		{
			description: `input[type=email]`,
			markup: /* HTML */ ` <input type="email" /> `,
			selector: `input`,
			role: `textbox`,
		},

		{
			description: `input[type=email][list]`,
			markup: /* HTML */ ` <input type="email" list /> `,
			selector: `input`,
			role: `combobox`,
		},

		{
			description: `input[type=image]`,
			markup: /* HTML */ ` <input type="image" /> `,
			selector: `input`,
			role: `button`,
		},

		{
			description: `input[type=number]`,
			markup: /* HTML */ ` <input type="number" /> `,
			selector: `input`,
			role: `spinbutton`,
		},

		{
			description: `input[type=radio]`,
			markup: /* HTML */ ` <input type="radio" /> `,
			selector: `input`,
			role: `radio`,
		},

		{
			description: `input[type=range]`,
			markup: /* HTML */ ` <input type="range" /> `,
			selector: `input`,
			role: `slider`,
		},

		{
			description: `input[type=reset]`,
			markup: /* HTML */ ` <input type="reset" /> `,
			selector: `input`,
			role: `button`,
		},

		{
			description: `input[type=search]`,
			markup: /* HTML */ ` <input type="search" /> `,
			selector: `input`,
			role: `searchbox`,
		},

		{
			description: `input[type=search][list]`,
			markup: /* HTML */ ` <input type="search" list /> `,
			selector: `input`,
			role: `combobox`,
		},

		{
			description: `input[type=submit]`,
			markup: /* HTML */ ` <input type="submit" /> `,
			selector: `input`,
			role: `button`,
		},

		{
			description: `input[type=tel]`,
			markup: /* HTML */ ` <input type="tel" /> `,
			selector: `input`,
			role: `textbox`,
		},

		{
			description: `input[type=tel][list]`,
			markup: /* HTML */ ` <input type="tel" list /> `,
			selector: `input`,
			role: `combobox`,
		},

		{
			description: `input[type=text]`,
			markup: /* HTML */ ` <input type="text" /> `,
			selector: `input`,
			role: `textbox`,
		},

		{
			description: `input[type=text][list]`,
			markup: /* HTML */ ` <input type="text" list /> `,
			selector: `input`,
			role: `combobox`,
		},

		{
			description: `input[type=invalid]`,
			markup: /* HTML */ ` <input type="invalid" /> `,
			selector: `input`,
			role: `textbox`,
		},

		{
			description: `input[type=invalid][list]`,
			markup: /* HTML */ ` <input type="invalid" list /> `,
			selector: `input`,
			role: `combobox`,
		},

		{
			description: `input[type=url]`,
			markup: /* HTML */ ` <input type="url" /> `,
			selector: `input`,
			role: `textbox`,
		},

		{
			description: `input[type=url][list]`,
			markup: /* HTML */ ` <input type="url" list /> `,
			selector: `input`,
			role: `combobox`,
		},

		{
			description: `input`,
			markup: /* HTML */ ` <input /> `,
			selector: `input`,
			role: `textbox`,
		},

		{
			description: `input[list]`,
			markup: /* HTML */ ` <input list /> `,
			selector: `input`,
			role: `combobox`,
		},

		{
			description: `ul li`,
			markup: /* HTML */ `
				<ul>
					<li></li>
				</ul>
			`,
			selector: `li`,
			role: `listitem`,
		},

		{
			description: `ol li`,
			markup: /* HTML */ `
				<ol>
					<li></li>
				</ol>
			`,
			selector: `li`,
			role: `listitem`,
		},

		{
			description: `menu li`,
			markup: /* HTML */ ` <menu> <li></li> </menu> `,
			selector: `li`,
			role: `listitem`,
		},

		{
			description: `li`,
			markup: /* HTML */ ` <li></li> `,
			selector: `li`,
			role: null,
		},

		{
			description: `main`,
			markup: /* HTML */ ` <main></main> `,
			selector: `main`,
			role: `main`,
		},

		{
			description: `math`,
			markup: /* HTML */ ` <math></math> `,
			selector: `math`,
			role: `math`,
		},

		{
			description: `menu`,
			markup: /* HTML */ ` <menu></menu> `,
			selector: `menu`,
			role: `list`,
		},

		{
			description: `meter`,
			markup: /* HTML */ ` <meter></meter> `,
			selector: `meter`,
			role: `meter`,
		},

		{
			description: `nav`,
			markup: /* HTML */ ` <nav></nav> `,
			selector: `nav`,
			role: `navigation`,
		},

		{
			description: `ol`,
			markup: /* HTML */ ` <ol></ol> `,
			selector: `ol`,
			role: `list`,
		},

		{
			description: `optgroup`,
			markup: /* HTML */ ` <optgroup></optgroup> `,
			selector: `optgroup`,
			role: `group`,
		},

		{
			description: `option`,
			markup: /* HTML */ ` <option></option> `,
			selector: `option`,
			role: `option`,
		},

		{
			description: `output`,
			markup: /* HTML */ ` <output></output> `,
			selector: `output`,
			role: `status`,
		},

		{
			description: `progress`,
			markup: /* HTML */ ` <progress></progress> `,
			selector: `progress`,
			role: `progressbar`,
		},

		{
			description: `search`,
			markup: /* HTML */ ` <search></search> `,
			selector: `search`,
			role: `search`,
		},

		{
			description: `section`,
			markup: /* HTML */ ` <section></section> `,
			selector: `section`,
			role: `region`,
		},

		{
			description: `select`,
			markup: /* HTML */ ` <select></select> `,
			selector: `select`,
			role: `combobox`,
		},

		{
			description: `select[multiple]`,
			markup: /* HTML */ ` <select multiple></select> `,
			selector: `select`,
			role: `listbox`,
		},

		{
			description: `select[size=2]`,
			markup: /* HTML */ ` <select size="2"></select> `,
			selector: `select`,
			role: `listbox`,
		},

		{
			description: `select[size=1]`,
			markup: /* HTML */ ` <select size="1"></select> `,
			selector: `select`,
			role: `combobox`,
		},

		{
			description: `table`,
			markup: /* HTML */ ` <table></table> `,
			selector: `table`,
			role: `table`,
		},

		{
			description: `tbody`,
			markup: /* HTML */ ` <tbody></tbody> `,
			selector: `tbody`,
			role: `rowgroup`,
		},

		{
			description: `textarea`,
			markup: /* HTML */ ` <textarea></textarea> `,
			selector: `textarea`,
			role: `textbox`,
		},

		{
			description: `tfoot`,
			markup: /* HTML */ ` <tfoot></tfoot> `,
			selector: `tfoot`,
			role: `rowgroup`,
		},

		{
			description: `thead`,
			markup: /* HTML */ ` <thead></thead> `,
			selector: `thead`,
			role: `rowgroup`,
		},

		{
			description: `time`,
			markup: /* HTML */ ` <time></time> `,
			selector: `time`,
			role: `time`,
		},

		{
			description: `table td`,
			markup: /* HTML */ `
				<table>
					<tr>
						<td></td>
					</tr>
				</table>
			`,
			selector: `td`,
			role: `cell`,
		},

		{
			description: `table[role=grid] td`,
			markup: /* HTML */ `
				<table role="grid">
					<tr>
						<td></td>
					</tr>
				</table>
			`,
			selector: `td`,
			role: `gridcell`,
		},

		{
			description: `table[role=treegrid] td`,
			markup: /* HTML */ `
				<table role="treegrid">
					<tr>
						<td></td>
					</tr>
				</table>
			`,
			selector: `td`,
			role: `gridcell`,
		},

		{
			description: `td`,
			markup: /* HTML */ ` <td></td> `,
			selector: `td`,
			role: null,
		},

		{
			description: `table[role=grid] th[scope=row]`,
			markup: /* HTML */ `
				<table role="grid">
					<tr>
						<th scope="row"></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `rowheader`,
		},

		{
			description: `table[role=grid] th[scope=col]`,
			markup: /* HTML */ `
				<table role="grid">
					<tr>
						<th scope="col"></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `columnheader`,
		},

		{
			description: `table[role=grid] th`,
			markup: /* HTML */ `
				<table role="grid">
					<tr>
						<th></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `gridcell`,
		},

		{
			description: `table[role=treegrid] th[scope=row]`,
			markup: /* HTML */ `
				<table role="treegrid">
					<tr>
						<th scope="row"></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `rowheader`,
		},

		{
			description: `table[role=treegrid] th[scope=col]`,
			markup: /* HTML */ `
				<table role="treegrid">
					<tr>
						<th scope="col"></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `columnheader`,
		},

		{
			description: `table[role=treegrid] th`,
			markup: /* HTML */ `
				<table role="treegrid">
					<tr>
						<th></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `gridcell`,
		},
		{
			description: `table th[scope=row]`,
			markup: /* HTML */ `
				<table>
					<tr>
						<th scope="row"></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `rowheader`,
		},

		{
			description: `table th[scope=col]`,
			markup: /* HTML */ `
				<table>
					<tr>
						<th scope="col"></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `columnheader`,
		},

		{
			description: `table[role=presentation] th`,
			markup: /* HTML */ `
				<table role="presentation">
					<tr>
						<th></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: null,
		},

		{
			description: `table th`,
			markup: /* HTML */ `
				<table>
					<tr>
						<th></th>
					</tr>
				</table>
			`,
			selector: `th`,
			role: `cell`,
		},

		{
			description: `th[scope=row]`,
			markup: /* HTML */ ` <th scope="row"></th> `,
			selector: `th`,
			role: null,
		},

		{
			description: `th[scope=col]`,
			markup: /* HTML */ ` <th></th> `,
			selector: `th`,
			role: null,
		},

		{
			description: `th`,
			markup: /* HTML */ ` <th></th> `,
			selector: `th`,
			role: null,
		},

		{
			description: `tr`,
			markup: /* HTML */ ` <tr></tr> `,
			selector: `tr`,
			role: `row`,
		},

		{
			description: `ul`,
			markup: /* HTML */ ` <ul></ul> `,
			selector: `ul`,
			role: `list`,
		},
	];

	it.each(specification)("$description", async ({ markup, selector, role: expectedRole }) => {
		expect.assertions(1);
		const role = await implicitRole(markup, selector);
		expect(role).toBe(expectedRole);
	});
});
