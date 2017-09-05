import { MetaTable } from 'meta';

describe('MetaTable', function(){

	const expect = require('chai').expect;

	describe('getMetaFor', function(){

		let table: MetaTable;

		beforeEach(function(){
			table = new MetaTable();
			table.loadFromObject({
				foo: {
					tagName: 'foo',
					metadata: false,
					flow: true,
					sectioning: false,
					heading: false,
					phrasing: true,
					embedded: false,
					interactive: false,
					deprecated: false,
					void: false,
				},
			});
		});

		it('should be populated for known elements', function(){
			const meta = table.getMetaFor('foo');
			expect(meta).not.to.be.undefined;
			expect(meta.tagName).to.equal('foo');
		});

		it('should be null for unknown elements', function(){
			const meta = table.getMetaFor('bar');
			expect(meta).to.be.null;
		});

	});

});
