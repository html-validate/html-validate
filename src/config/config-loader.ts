import { Config } from './config';

const path = require('path');
const fs = require('fs');

export class ConfigLoader {
	public fromTarget(filename: string): Config {
		if (filename === 'inline'){
			return Config.empty();
		}

		let current = path.resolve(path.dirname(filename));
		let config = Config.empty();

		do {
			const search = path.join(current, '.htmlvalidate.json');

			if (fs.existsSync(search)){
				const local = Config.fromFile(search);
				config = local.merge(config);
			}

			current = path.dirname(current);
		} while (current !== '/');

		return config;
	}
}
