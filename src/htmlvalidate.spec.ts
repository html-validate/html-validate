import { Source } from './context';
import { Engine } from './engine';
import HtmlValidate from './htmlvalidate';

jest.mock('./engine');

function engineInstance(): Engine {
	return (Engine as any).mock.instances[0];
}

describe('HtmlValidate', () => {

	it('validateSource() should lint given source', () => {
		const htmlvalidate = new HtmlValidate();
		const source: Source = {data: 'foo', filename: 'inline', line: 1, column: 1};
		htmlvalidate.validateSource(source);
		const engine = engineInstance();
		expect(engine.lint).toHaveBeenCalledWith([source]);
	});

});
