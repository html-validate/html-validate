import HtmlValidate from './htmlvalidate';

type ContentCategory =
	'@embedded' |
	'@flow' |
	'@heading' |
	'@interactive' |
	'@metadata' |
	'@phrasing' |
	'@sectioning'
;

const contentCategory = {
	'@embedded': 'audio',
	'@flow': 'div',
	'@heading': 'h1',
	'@interactive': 'button',
	'@metadata': 'style',
	'@phrasing': 'span',
	'@sectioning': 'article',
};

function inlineSource(source: string){
	return {
		data: source,
		filename: 'inline',
		line: 1,
		column: 1,
	};
}

function getTagname(category: ContentCategory|string){
	if (category[0] === '@'){
		return contentCategory[category as ContentCategory];
	} else {
		return category;
	}
}

function getElementMarkup(tagName: string, variant: string){
	switch (variant){
	case 'void':
		return `<${tagName}/>`;
	default:
		return `<${tagName}>foo</${tagName}>`;
	}
}

describe('HTML elements', function(){

	const expect = require('chai').expect;
	const htmlvalidate = new HtmlValidate({
		rules: {
			'deprecated': 'error',
			'element-permitted-content': 'error',
			'element-permitted-occurrences': 'error',
			'element-permitted-order': 'error',
			'void': ['error', {style: 'any'}],
		},
	});

	function allow(markup: string, comment: string){
		it(`should allow ${comment}`, function(){
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.true;
		});
	}

	function allowContent(tagName: string, category: string, variant: string = undefined){
		const child = getTagname(category);
		const pretty = category[0] === '@' ? category : `<${category}>`;
		const inner = getElementMarkup(child, variant);
		it(`should allow ${pretty} as content`, function(){
			const markup = `<${tagName}>${inner}</${tagName}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.true;
		});
	}

	function allowParent(tagName: string, category: string, variant: string = undefined){
		const outer = getTagname(category);
		const inner = getElementMarkup(tagName, variant);
		it(`should allow <${outer}> as parent`, function(){
			const markup = `<${outer}>${inner}</${outer}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.true;
		});
	}

	function disallow(markup: string, comment: string){
		it(`should not allow ${comment}`, function(){
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.false;
		});
	}

	function disallowContent(tagName: string, category: string){
		const child = getTagname(category);
		const pretty = category[0] === '@' ? category : `<${category}>`;
		it(`should disallow ${pretty} as content`, function(){
			const markup = `<${tagName}><${child}>foo</${child}></${tagName}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.false;
		});
	}

	function disallowDescendant(tagName: string, category: string){
		const child = getTagname(category);
		const pretty = category[0] === '@' ? category : `<${category}>`;
		it(`should disallow ${pretty} as descendant`, function(){
			const markup = `<${tagName}><span><${child}>foo</${child}></span></${tagName}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.false;
		});
	}

	function disallowNesting(tagName: string){
		disallowContent(tagName, tagName);
	}

	function disallowParent(tagName: string, category: string, variant: string = undefined){
		const outer = getTagname(category);
		const inner = getElementMarkup(tagName, variant);
		it(`should disallow <${outer}> as parent`, function(){
			const markup = `<${outer}>${inner}</${outer}>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.false;
		});
	}

	function deprecated(tagName: string){
		it('should report as deprecated', function(){
			const report = htmlvalidate.validateString(`<${tagName}></${tagName}>`);
			expect(report.valid).to.be.false;
			expect(report.results[0].messages[0].ruleId).to.equal('deprecated');
		});
	}

	function omitEnd(tagName: string){
		it('should allow omitted end tag', function(){
			const markup = `<${tagName}/>`;
			const report = htmlvalidate.validateString(markup);
			expect(report.valid, markup).to.be.true;
		});
	}

	function defaultTextLevel(tagName: string){
		allowContent(tagName, '@phrasing');
		allowParent(tagName, 'div');
		allowParent(tagName, 'span');
		disallowContent(tagName, '@flow');
	}

	describe('<a>', function(){
		allowContent('a', '@phrasing');
		allowParent('a', 'div');
		allowParent('a', 'span');
		allowParent('a', 'td');
		disallowDescendant('a', 'a');
		disallowDescendant('a', '@interactive');
	});

	describe("<abbr>", function(){
		allowContent('abbr', '@phrasing');
		disallowContent('abbr', '@flow');
	});

	describe("<acronym>", function(){
		deprecated('acronym');
	});

	describe("<address>", function(){
		allowContent('address', '@phrasing');
		allowContent('address', '@flow');
		disallowDescendant('address', '@heading');
		disallowDescendant('address', '@sectioning');
		disallowDescendant('address', 'address');
		disallowDescendant('address', 'header');
		disallowDescendant('address', 'footer');
	});

	describe("<applet>", function(){
		deprecated('applet');
	});

	/** @todo verify isDescendant flow and phrasing */
	describe("<area>", function(){
		omitEnd('area');
	});

	describe("<article>", function(){
		allowContent('article', '@flow');
		disallowDescendant('article', 'main');
	});

	describe("<aside>", function(){
		allowContent('aside', '@flow');
		disallowDescendant('aside', 'main');
	});

	describe("<audio>", function(){
		allowParent('audio', '@flow');
		allow('<span><audio><span>foo</span></audio></span>', 'phrasing nested in phrasing');
		disallowDescendant('audio', 'audio');
		disallowDescendant('audio', 'video');
		disallow('<span><audio><div>foo</div></audio></span>', 'flow nested in phrasing');
		disallow(`<audio><source></source><track></track><div></div></audio>`, 'in right order');
		disallow(`<audio><track></track><source></source></audio>`, 'track before source');
		disallow(`<audio><div></div><track></track></audio>`, '@flow before track');

		it('should be interactive only if "controls" attribute is set', function(){
			const source = inlineSource('<audio></audio><audio controls></audio>');
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<b>", function(){
		defaultTextLevel('b');
	});

	describe("<base>", function(){
		omitEnd('base');
		allowParent('base', 'head', 'void');
		disallowParent('base', 'div');
	});

	describe("<basefont>", function(){
		deprecated('basefont');
	});

	describe("<bdi>", function(){
		defaultTextLevel('bdi');
	});

	describe("<bdo>", function(){
		defaultTextLevel('bdo');
	});

	describe("<bgsound>", function(){
		deprecated('bgsound');
	});

	describe("<big>", function(){
		deprecated('big');
	});

	describe("<blink>", function(){
		deprecated('blink');
	});

	describe("<blockquote>", function(){
		allowContent('blockquote', '@flow');
		allowParent('blockquote', 'div');
	});

	describe("<body>", function(){
		allowParent('body', 'html');
		disallowParent('body', 'div');
	});

	describe("<br>", function(){
		omitEnd('br');
		allowParent('br', 'span', 'void');
		allowParent('br', 'div', 'void');
	});

	describe("<button>", function(){
		allowContent('button', '@phrasing');
		allowParent('button', 'span');
		allowParent('button', 'div');
		disallowContent('button', '@flow');
		disallowDescendant('button', '@interactive');
		disallowNesting('button');
	});

	describe("<canvas>", function(){
		allowContent('canvas', '@flow');
		allowParent('canvas', 'div');
	});

	describe("<caption>", function(){
		allowContent('caption', '@flow');
		allowParent('caption', 'table');
		disallowDescendant('caption', 'table');
		disallowParent('caption', 'div');
	});

	describe("<center>", function(){
		deprecated('center');
	});

	describe("<cite>", function(){
		defaultTextLevel('cite');
	});

	describe("<code>", function(){
		defaultTextLevel('code');
	});

	describe("<col>", function(){
		omitEnd('col');
		allowParent('col', 'colgroup', 'void');
		disallowParent('col', 'div', 'void');
	});

	describe("<colgroup>", function(){
		allowParent('colgroup', 'table');
		disallowParent('colgroup', 'div');
		allow('<colgroup><col/></colgroup>', '<col> as content');
		allowContent('colgroup', 'template');
		disallowContent('colgroup', 'span');
	});

	describe("<data>", function(){
		defaultTextLevel('data');
	});

	describe("<datalist>", function(){
		defaultTextLevel('datalist');
		allowContent('datalist', 'option');
	});

	describe("<dd>", function(){
		allowParent('dd', 'dl');
		disallowParent('dd', 'div');
		allowContent('dd', '@flow');
	});

	describe("<del>", function(){
		allow('<span><del><span>foo</span></del></span>', 'phrasing in phrasing context');
		allow('<div><del><div>foo</div></del></div>', 'flow in flow context');
		disallow('<span><del><div>foo</div></del></span>', 'flow in phrasing context');
	});

	describe("<dfn>", function(){
		defaultTextLevel('dfn');
		disallowDescendant('dfn', 'dfn');
	});

	describe("<dir>", function(){
		deprecated('dir');
	});

	describe("<div>", function(){
		allowContent('div', '@flow');
		allowParent('div', 'body');
	});

	describe("<dl>", function(){
		allowParent('dl', '@flow');
		allowContent('dl', 'dt');
		allowContent('dl', 'dd');
		allowContent('dl', 'script');
		allowContent('dl', 'template');
	});

	describe("<dt>", function(){
		allowParent('dt', 'dl');
		allowContent('dt', '@flow');
		disallowDescendant('dt', 'header');
		disallowDescendant('dt', 'footer');
		disallowDescendant('dt', '@sectioning');
		disallowDescendant('dt', '@heading');
	});

	describe("<em>", function(){
		defaultTextLevel('em');
	});

	describe("<embed>", function(){
		omitEnd('embed');
		allowParent('embed', '@flow', 'void');
		allowParent('embed', '@phrasing', 'void');
	});

	describe("<fieldset>", function(){
		allowParent('fieldset', '@flow');
		allowContent('fieldset', '@flow');
		allowContent('fieldset', 'legend');
		allow(`<fieldset>
			<legend></legend>
			<div></div>
		</fieldset>`, '@flow after legend');
		disallow(`<fieldset>
			<div></div>
			<legend></legend>
		</fieldset>`, 'legend after @flow');
	});

	describe("<figcaption>", function(){
		allowParent('figcaption', 'figure');
		allowContent('figcaption', '@flow');
	});

	describe("<figure>", function(){
		allowParent('figure', '@flow');
		allowContent('figure', '@flow');
		allowContent('figure', 'figcaption');
		allow(`<figure><figcaption></figcaption><div></div></figure>`, 'figcaption as first child');
		allow(`<figure><div></div><figcaption></figcaption></figure>`, 'figcaption as last child');
		disallow(`<figure><figcaption></figcaption><figcaption></figcaption></figure>`, 'multiple figcaption');
	});

	describe("<font>", function(){
		deprecated('font');
	});

	describe("<footer>", function(){
		allowParent('footer', '@flow');
		allowContent('footer', '@flow');
		disallowDescendant('footer', 'header');
		disallowDescendant('footer', 'footer');
		disallowDescendant('footer', 'main');
	});

	describe("<form>", function(){
		allowParent('form', '@flow');
		allowContent('form', '@flow');
		disallowDescendant('form', 'form');
	});

	describe("<frame>", function(){
		deprecated('frame');
	});

	describe("<frameset>", function(){
		deprecated('frameset');
	});

	describe("<h1>", function(){
		allowParent('h1', '@flow');
		allowContent('h1', '@phrasing');
		disallowContent('h1', '@flow');
	});

	describe("<h2>", function(){
		allowParent('h2', '@flow');
		allowContent('h2', '@phrasing');
		disallowContent('h2', '@flow');
	});

	describe("<h3>", function(){
		allowParent('h3', '@flow');
		allowContent('h3', '@phrasing');
		disallowContent('h3', '@flow');
	});

	describe("<h4>", function(){
		allowParent('h4', '@flow');
		allowContent('h4', '@phrasing');
		disallowContent('h4', '@flow');
	});

	describe("<h5>", function(){
		allowParent('h5', '@flow');
		allowContent('h5', '@phrasing');
		disallowContent('h5', '@flow');
	});

	describe("<h6>", function(){
		allowParent('h6', '@flow');
		allowContent('h6', '@phrasing');
		disallowContent('h6', '@flow');
	});

	describe("<head>", function(){
		allowParent('head', 'html');
		allowContent('head', '@meta');
		disallowContent('head', '@flow');
		disallowContent('head', '@phrasing');
		disallow(`<head>
			<base>
			<base>
		</head>`, 'more than one base');
		disallow(`<head>
			<base>
			<base>
		</head>`, 'more than one title');
	});

	describe("<header>", function(){
		allowParent('header', '@flow');
		allowContent('header', '@flow');
		disallowDescendant('header', 'header');
		disallowDescendant('header', 'footer');
		disallowDescendant('header', 'main');
	});

	describe("<hgroup>", function(){
		deprecated('hgroup');
	});

	describe("<hr>", function(){
		omitEnd('hr');
	});

	describe("<html>", function(){
		allow(`<html><head></head></html>`, 'more than one title');
		disallow(`<html>
			<head></head>
			<head></head>
		</html>`, 'more than one head');
		disallow(`<html>
			<body></body>
			<body></body>
		</html>`, 'more than one body');
		disallow(`<html>
			<body></body>
			<head></head>
		</html>`, 'body before head');
	});

	describe("<i>", function(){
		defaultTextLevel('i');
	});

	describe("<iframe>", function(){
		disallowContent('iframe', '@flow');
		disallowContent('iframe', '@phrasing');
	});

	describe("<img>", function(){
		omitEnd('img');

		it('should be interactive only if "usemap" attribute is set', function(){
			const source = inlineSource('<img/><img usemap/>');
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<input>", function(){
		omitEnd('input');

		it('should be interactive only if "type" is not "hidden"', function(){
			const source = inlineSource('<input type="hidden"/><input type="foo"/>');
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<ins>", function(){
		allow('<span><ins><span>foo</span></ins></span>', 'phrasing in phrasing context');
		allow('<div><ins><div>foo</div></ins></div>', 'flow in flow context');
		disallow('<span><ins><div>foo</div></ins></span>', 'flow in phrasing context');
	});

	describe("<isindex>", function(){
		deprecated('isindex');
	});

	describe("<kbd>", function(){
		defaultTextLevel('kbd');
	});

	describe("<keygen>", function(){
		omitEnd('keygen');
	});

	describe("<label>", function(){
		allowContent('label', '@phrasing');
		disallowContent('label', '@flow');
		disallowDescendant('label', 'label');
	});

	describe("<legend>", function(){
		allowContent('legend', '@phrasing');
		disallowContent('legend', '@flow');
	});

	describe("<li>", function(){
		allowContent('li', '@flow');
	});

	describe("<link>", function(){
		omitEnd('link');
	});

	describe("<listing>", function(){
		deprecated('listing');
	});

	describe("<maín>", function(){
		allowContent('main', '@flow');
	});

	/** @todo what to test? */
	describe("<map>", function(){

	});

	describe("<mark>", function(){
		defaultTextLevel('mark');
	});

	describe("<marquee>", function(){
		deprecated('marquee');
	});

	/** @todo mathml? */
	describe("<math>", function(){

	});

	describe("<menu>", function(){

	});

	describe("<meta>", function(){
		omitEnd('meta');
	});

	describe("<meter>", function(){
		allowContent('meter', '@phrasing');
		disallowContent('meter', '@flow');
		disallowDescendant('meter', 'meter');
	});

	describe("<multicol>", function(){
		deprecated('multicol');
	});

	describe("<nav>", function(){
		allowContent('nav', '@flow');
		disallowDescendant('nav', 'main');
	});

	describe("<nextid>", function(){
		deprecated('nextid');
	});

	describe("<nobr>", function(){
		deprecated('nobr');
	});

	describe("<noembed>", function(){
		deprecated('noembed');
	});

	describe("<noframes>", function(){
		deprecated('noframes');
	});

	/** @todo noscript has more rules for the content model */
	describe("<noscript>", function(){
		disallowDescendant('noscript', 'noscript');
	});

	describe('<object>', function(){
		allowContent('object', '@flow');
		allowContent('object', 'param', 'void');
		allow('<span><object><span>foo</span></object></span>', 'phrasing in phrasing context');
		allow('<div><object><div>foo</div></object></div>', 'flow in flow context');
		disallow('<span><object><div>foo</div></object></span>', 'flow in phrasing context');
		disallow(`<object><param></param><div></div></object>`, 'param before @flow');
		disallow(`<object><div></div><param></param></object>`, '@flow before param');

		it('should be interactive only if "usemap" attribute is set', function(){
			const source = inlineSource('<object></object><object usemap></object>');
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<ol>", function(){
		allowContent('ol', 'li');
		allowContent('ol', 'script');
		allowContent('ol', 'template');
	});

	describe('<optgroup>', function(){
		allowContent('optgroup', 'option');
		allowContent('optgroup', 'script');
		allowContent('optgroup', 'template');
	});

	describe('<option>', function(){
		allowParent('option', 'select');
		allowParent('option', 'optgroup');
		disallowContent('option', '@flow');
		disallowContent('option', '@phrasing');
	});

	describe("<output>", function(){
		allowContent('output', '@phrasing');
		disallowContent('output', '@flow');
	});

	describe("<p>", function(){
		allowContent('p', '@phrasing');
		disallow('<p><figure>foo</figure></p>', '@flow as content'); /* many regular flow content such as <div> will cause <p> to be implicitly closed */
	});

	describe("<param>", function(){
		omitEnd('param');
		allowParent('param', 'object', 'void');
	});

	describe("<plaintext>", function(){
		deprecated('plaintext');
	});

	describe("<pre>", function(){
		allowContent('pre', '@phrasing');
		disallowContent('pre', '@flow');
	});

	describe("<progress>", function(){
		allowContent('progress', '@phrasing');
		disallowContent('progress', '@flow');
		disallowDescendant('progress', 'progress');
	});

	describe("<q>", function(){
		defaultTextLevel('q');
	});

	describe("<rb>", function(){
		allowParent('rb', 'ruby');
		allowContent('rb', '@phrasing');
		disallowContent('rb', '@flow');
	});

	describe("<rp>", function(){
		allowParent('rp', 'ruby');
		allowContent('rp', '@phrasing');
		disallowContent('rp', '@flow');
	});

	describe("<rt>", function(){
		allowParent('rt', 'ruby');
		allowParent('rt', 'rtc');
		allowContent('rt', '@phrasing');
		disallowContent('rt', '@flow');
	});

	describe("<rtc>", function(){
		allowParent('rtc', 'ruby');
		allowContent('rtc', '@phrasing');
		allowContent('rtc', 'rt');
		disallowContent('rtc', '@flow');
	});

	describe("<ruby>", function(){
		allowContent('ruby', 'rb');
		allowContent('ruby', 'rp');
		allowContent('ruby', 'rt');
		allowContent('ruby', 'rtc');
		defaultTextLevel('ruby');
	});

	describe("<s>", function(){
		defaultTextLevel('s');
	});

	describe("<samp>", function(){
		defaultTextLevel('samp');
	});

	describe("<script>", function(){
		allowParent('script', 'head');
		allowParent('script', '@flow');
	});

	describe("<section>", function(){
		allowContent('section', '@flow');
	});

	describe("<select>", function(){
		allowContent('select', 'option');
		allowContent('select', 'optgroup');
		allowContent('select', 'script');
		allowContent('select', 'template');
	});

	describe("<small>", function(){
		defaultTextLevel('small');
	});

	describe("<source>", function(){
		omitEnd('source');
		allowParent('source', 'audio', 'void');
		allowParent('source', 'video', 'void');
	});

	describe("<spacer>", function(){
		deprecated('spacer');
	});

	describe("<span>", function(){
		defaultTextLevel('span');
	});

	describe("<strike>", function(){
		deprecated('strike');
	});

	describe("<strong>", function(){
		defaultTextLevel('strong');
	});

	describe("<style>", function(){
		disallowContent('style', '@flow');
		disallowContent('style', '@phrasing');
	});

	describe("<sub>", function(){
		defaultTextLevel('sub');
	});

	describe("<sup>", function(){
		defaultTextLevel('sup');
	});

	describe("<svg>", function(){
		allowContent('svg', '@flow');
	});

	describe("<table>", function(){
		allowContent('table', 'caption');
		allowContent('table', 'colgroup');
		allowContent('table', 'script');
		allowContent('table', 'tbody');
		allowContent('table', 'template');
		allowContent('table', 'tfoot');
		allowContent('table', 'thead');
		allowContent('table', 'tr');
		disallowContent('table', '@phrasing');
		allow(`<table>
			<caption></caption>
			<colgroup></colgroup>
			<thead></thead>
			<tbody></tbody>
			<tfoot></tfoot>
		</table>`, 'with right order and occurrences');
		disallow(`<table>
			<caption></caption>
			<caption></caption>
		</table>`, 'more than one caption');
		disallow(`<table>
			<thead></thead>
			<thead></thead>
		</table>`, 'more than one thead');
		disallow(`<table>
			<tfoot></tfoot>
			<tfoot></tfoot>
		</table>`, 'more than one tfoot');
		disallow(`<table>
			<thead></thead>
			<caption>bar</caption>
		</table>`, 'caption after thead');
		disallow(`<table>
			<tfoot></tfoot>
			<thead></thead>
		</table>`, 'thead after tfoot');
	});

	describe("<tbody>", function(){
		allowParent('tbody', 'table');
		allowContent('tbody', 'tr');
		allowContent('tbody', 'script');
		allowContent('tbody', 'template');
		disallowContent('tbody', '@phrasing');
	});

	describe("<td>", function(){
		allowParent('td', 'tr');
		allowContent('td', '@flow');
	});

	describe("<textarea>", function(){
		disallowContent('textarea', '@flow');
		disallowContent('textarea', '@phrasing');
	});

	describe("<tfoot>", function(){
		allowParent('tfoot', 'table');
		allowContent('tfoot', 'tr');
		allowContent('tfoot', 'script');
		allowContent('tfoot', 'template');
		disallowContent('tfoot', '@phrasing');
	});

	describe("<th>", function(){
		allowParent('th', 'tr');
		allowContent('th', '@flow');
		disallowDescendant('th', 'header');
		disallowDescendant('th', 'footer');
		disallowDescendant('th', '@sectioning');
		disallowDescendant('th', '@heading');
	});

	describe("<thead>", function(){
		allowParent('thead', 'table');
		allowContent('thead', 'tr');
		allowContent('thead', 'script');
		allowContent('thead', 'template');
		disallowContent('thead', '@phrasing');
	});

	describe("<time>", function(){
		defaultTextLevel('time');
	});

	describe("<title>", function(){
		allowParent('title', 'head');
		disallowContent('title', '@flow');
		disallowContent('title', '@phrasing');
	});

	describe("<tr>", function(){
		allowParent('tr', 'table');
		allowParent('tr', 'thead');
		allowParent('tr', 'tfoot');
		allowParent('tr', 'tbody');
		allowContent('tr', 'td');
		allowContent('tr', 'th');
		allowContent('tr', 'script');
		allowContent('tr', 'template');
	});

	describe("<track>", function(){
		omitEnd('track');
	});

	describe("<tt>", function(){
		deprecated('tt');
	});

	describe("<u>", function(){
		defaultTextLevel('u');
	});

	describe("<ul>", function(){
		allowContent('ul', 'li');
		allowContent('ul', 'script');
		allowContent('ul', 'template');
	});

	describe("<var>", function(){
		defaultTextLevel('var');
	});

	describe('<video>', function(){
		allowParent('video', '@flow');
		allow('<span><video><span>foo</span></video></span>', 'phrasing nested in phrasing');
		disallowDescendant('video', 'audio');
		disallowDescendant('video', 'video');
		disallow('<span><video><div>foo</div></video></span>', 'flow nested in phrasing');
		disallow(`<video><source></source><track></track><div></div></video>`, 'in right order');
		disallow(`<video><track></track><source></source></video>`, 'track before source');
		disallow(`<video><div></div><track></track></video>`, '@flow before track');

		it('should be interactive only if "controls" attribute is set', function(){
			const source = inlineSource('<video></video><video controls></video>');
			const parser = htmlvalidate.getParserFor(source);
			const [foo, bar] = parser.parseHtml(source).root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<wbr>", function(){
		omitEnd('wbr');
	});

	describe("<xmp>", function(){
		deprecated('xmp');
	});

});
