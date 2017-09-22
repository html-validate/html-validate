import HtmlLint from './htmllint';

describe.only('HTML elements', function(){

	const expect = require('chai').expect;
	const htmllint = new HtmlLint({
		rules: {
			'deprecated': 'error',
		},
	});

	function deprecated(tagName: string){
		it('should report as deprecated', function(){
			const report = htmllint.string(`<${tagName}></${tagName}>`);
			expect(report.valid).to.be.false;
			expect(report.results[0].messages[0].ruleId).to.equal('deprecated');
		});
	}

	describe("<acronym>", function(){
		deprecated('acronym');
	});

	describe("<applet>", function(){
		deprecated('applet');
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

	describe("<center>", function(){
		deprecated('center');
	});

	describe("<dir>", function(){
		deprecated('dir');
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

	describe("<isindex>", function(){
		deprecated('isindex');
	});

	describe("<listing>", function(){
		deprecated('listing');
	});

	describe("<marquee>", function(){
		deprecated('marquee');
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

	describe("<plaintext>", function(){
		deprecated('plaintext');
	});

	describe("<spacer>", function(){
		deprecated('spacer');
	});

	describe("<strike>", function(){
		deprecated('strike');
	});

	describe("<tt>", function(){
		deprecated('tt');
	});

	describe("<xmp>", function(){
		deprecated('xmp');
	});

});
