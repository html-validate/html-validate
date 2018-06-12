import { Result } from '../reporter';

const fs = require('fs');

export function getFormatters(formatters: string): ((results: Result[]) => void)[] {
	return formatters.split(',').map(cur => {
		const [name, dst] = cur.split('=', 2);
		const moduleName = name.replace(/[^a-z]+/g, '');
		const formatter = require(`../formatters/${moduleName}`);
		return (results: Result[]) => {
			const output = formatter(results);
			if (dst){
				fs.writeFileSync(dst, output, 'utf-8');
			} else {
				process.stdout.write(output);
			}
		};
	});
}
