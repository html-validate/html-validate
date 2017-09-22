import HtmlLint from './htmllint';

describe.only('HTML elements', function(){

	const expect = require('chai').expect;
	const htmllint = new HtmlLint({
		rules: {
			'deprecated': 'error',
			'void': 'error',
		},
	});

	function deprecated(tagName: string){
		it('should report as deprecated', function(){
			const report = htmllint.string(`<${tagName}></${tagName}>`);
			expect(report.valid).to.be.false;
			expect(report.results[0].messages[0].ruleId).to.equal('deprecated');
		});
	}

	function omitEnd(tagName: string){
		it('should allow omitted end tag', function(){
			const markup = `<${tagName}/>`;
			const report = htmllint.string(markup);
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
	});

	describe("<input>", function(){
		omitEnd('input');
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

	describe("<wbr>", function(){
		omitEnd('wbr');
	});

	describe("<xmp>", function(){
		deprecated('xmp');
	});

});
