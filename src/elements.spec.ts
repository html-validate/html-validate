import HtmlValidate from './htmlvalidate';

describe('HTML elements', function(){

	const expect = require('chai').expect;
	const htmlvalidate = new HtmlValidate({
		rules: {
			'deprecated': 'error',
			'void': ['error', {style: 'any'}],
		},
	});

	function deprecated(tagName: string){
		it('should report as deprecated', function(){
			const report = htmlvalidate.string(`<${tagName}></${tagName}>`);
			expect(report.valid).to.be.false;
			expect(report.results[0].messages[0].ruleId).to.equal('deprecated');
		});
	}

	function omitEnd(tagName: string){
		it('should allow omitted end tag', function(){
			const markup = `<${tagName}/>`;
			const report = htmlvalidate.string(markup);
			expect(report.valid, markup).to.be.true;
		});
	}

	describe("<acronym>", function(){
		deprecated('acronym');
	});

	describe("<applet>", function(){
		deprecated('applet');
	});

	describe("<area>", function(){
		omitEnd('area');
	});

	describe('<audio>', function(){
		it('should be interactive only if "controls" attribute is set', function(){
			const parser = htmlvalidate.getParser();
			const [foo, bar] = parser.parseHtml('<audio></audio><audio controls></audio>').root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<base>", function(){
		omitEnd('base');
	});

	describe("<basefont>", function(){
		deprecated('basefont');
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

	describe("<br>", function(){
		omitEnd('br');
	});

	describe("<center>", function(){
		deprecated('center');
	});

	describe("<col>", function(){
		omitEnd('col');
	});

	describe("<dir>", function(){
		deprecated('dir');
	});

	describe("<embed>", function(){
		omitEnd('embed');
	});

	describe("<font>", function(){
		deprecated('font');
	});

	describe("<frame>", function(){
		deprecated('frame');
	});

	describe("<frameset>", function(){
		deprecated('frameset');
	});

	describe("<hgroup>", function(){
		deprecated('hgroup');
	});

	describe("<hr>", function(){
		omitEnd('hr');
	});

	describe("<img>", function(){
		omitEnd('img');

		it('should be interactive only if "usemap" attribute is set', function(){
			const parser = htmlvalidate.getParser();
			const [foo, bar] = parser.parseHtml('<img/><img usemap/>').root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<input>", function(){
		omitEnd('input');

		it('should be interactive only if "type" is not "hidden"', function(){
			const parser = htmlvalidate.getParser();
			const [foo, bar] = parser.parseHtml('<input type="hidden"/><input type="foo"/>').root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<isindex>", function(){
		deprecated('isindex');
	});

	describe("<keygen>", function(){
		omitEnd('keygen');
	});

	describe("<link>", function(){
		omitEnd('link');
	});

	describe("<listing>", function(){
		deprecated('listing');
	});

	describe("<marquee>", function(){
		deprecated('marquee');
	});

	describe("<meta>", function(){
		omitEnd('meta');
	});

	describe("<multicol>", function(){
		deprecated('multicol');
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

	describe('<object>', function(){
		it('should be interactive only if "usemap" attribute is set', function(){
			const parser = htmlvalidate.getParser();
			const [foo, bar] = parser.parseHtml('<object></object><object usemap></object>').root.children;
			expect(foo.meta.interactive).to.be.false;
			expect(bar.meta.interactive).to.be.true;
		});
	});

	describe("<param>", function(){
		omitEnd('param');
	});

	describe("<plaintext>", function(){
		deprecated('plaintext');
	});

	describe("<source>", function(){
		omitEnd('source');
	});

	describe("<spacer>", function(){
		deprecated('spacer');
	});

	describe("<strike>", function(){
		deprecated('strike');
	});

	describe("<track>", function(){
		omitEnd('track');
	});

	describe("<tt>", function(){
		deprecated('tt');
	});

	describe('<video>', function(){
		it('should be interactive only if "controls" attribute is set', function(){
			const parser = htmlvalidate.getParser();
			const [foo, bar] = parser.parseHtml('<video></video><video controls></video>').root.children;
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
