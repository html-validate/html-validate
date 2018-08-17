const glob = require('glob');
const files = glob.sync('test-files/config/**/*.html');
import HtmlValidate from '../htmlvalidate';
import { ConfigLoader } from './config-loader';

describe('ConfigLoader', function(){

	let loader: ConfigLoader;

	beforeAll(() => {
		loader = new ConfigLoader();
	});

	describe('smoketest', () => {

		files.forEach((filename: string) => {
			it(filename, () => {
				const config = loader.fromTarget(filename);
				const htmlvalidate = new HtmlValidate(config);
				const report = htmlvalidate.validateFile(filename);
				expect(report.results).toMatchSnapshot();
			});
		});

	});

});
