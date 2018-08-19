import { Attribute } from './attribute';
import { Location } from 'context';

describe('Attribute', () => {

	it('should set fields', () => {
		const location: Location = {filename: 'file', line: 1, column: 2};
		const attr = new Attribute('foo', 'bar', location);
		expect(attr.key).toEqual('foo');
		expect(attr.value).toEqual('bar');
		expect(attr.location).toEqual(location);
	});

});
