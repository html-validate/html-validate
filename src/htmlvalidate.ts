import { Config, ConfigLoader } from './config';
import { Engine } from './engine';
import { Parser } from './parser';
import { DOMNode } from 'dom';
import { Report } from './reporter';
import { Source } from './context';
import { Lexer, TokenType } from './lexer';

class HtmlValidate {
	private globalConfig: Config;

	constructor(options?: any){
		const defaults = Config.defaultConfig();
		this.globalConfig = defaults.merge(Config.fromObject(options || {}));
	}

	/**
	 * Parse HTML from string.
	 *
	 * @param str {string} - Text to parse.
	 * @return {object} - Report output.
	 */
	public validateString(str: string): Report {
		const source = [{
			data: str,
			filename: 'inline',
			line: 1,
			column: 1,
		}];
		const config = this.getConfigFor('inline');
		return this.process(source, config, 'lint');
	}

	/**
	 * Parse HTML from file.
	 *
	 * @param filename {string} - Filename to read and parse.
	 * @return {object} - Report output.
	 */
	public validateFile(filename: string, mode?: string): Report {
		const config = this.getConfigFor(filename);
		const source = config.transform(filename);
		return this.process(source, config, mode);
	}

	private process(source: Source[], config: Config, mode?: string){
		switch (mode){
		case 'lint':
		case undefined:
			return this.parse(source, config);
		case 'dump-events':
			return this.dumpEvents(source, config);
		case 'dump-tokens':
			return this.dumpTokens(source);
		case 'dump-tree':
			return this.dumpTree(source, config);
		default:
			throw new Error(`Unknown mode "${mode}"`);
		}
	}

	/**
	 * Internal parse method.
	 *
	 * @param src {object} - Parse source.
	 * @param src.data {string} - Text HTML data.
	 * @param src.filename {string} - Filename of source for presentation in report.
	 * @return {object} - Report output.
	 */
	private parse(source: Source[], config: Config): Report {
		const engine = new Engine(config);
		return engine.process(source);
	}

	private dumpEvents(source: Source[], config: Config): Report {
		const parser = new Parser(config);
		const filtered = ['parent', 'children'];

		parser.on('*', (event, data) => {
			const strdata = JSON.stringify(data, (key, value) => {
				return filtered.indexOf(key) >= 0 ? '[truncated]' : value;
			}, 2);
			process.stdout.write(`${event}: ${strdata}\n`);
		});
		source.forEach(src => parser.parseHtml(src));

		return {
			valid: true,
			results: [],
		};
	}

	private dumpTokens(source: Source[]): Report {
		const lexer = new Lexer();
		for (const src of source){
			for (const token of lexer.tokenize(src)){
				const data = token.data ? token.data[0] : null;
				process.stdout.write(`TOKEN: ${TokenType[token.type]}
  Data: ${JSON.stringify(data)}
  Location: ${token.location.filename}:${token.location.line}:${token.location.column}
`);
			}
		}
		return {
			valid: true,
			results: [],
		};
	}

	private dumpTree(source: Source[], config: Config): Report {
		const parser = new Parser(config);
		const dom = parser.parseHtml(source[0]); /* @todo handle dumping each tree */

		function decoration(node: DOMNode){
			let output = '';
			if (node.hasAttribute('id')){
				output += `#${node.getAttribute('id')}`;
			}
			if (node.hasAttribute('class')){
				output += `.${node.classList.join('.')}`;
			}
			return output;
		}

		function printNode(node: DOMNode, level: number, sibling: number){
			if (level > 0){
				const indent = '  '.repeat(level - 1);
				const l = node.children.length > 0 ? '┬' : '─';
				const b = sibling < (node.parent.children.length - 1) ? '├' : '└';
				process.stdout.write(`${indent}${b}─${l} ${node.tagName}${decoration(node)}\n`);
			} else {
				process.stdout.write(`(root)\n`);
			}

			node.children.forEach((child, index) => printNode(child, level + 1, index));
		}

		printNode(dom.root, 0, 0);

		return {
			valid: true,
			results: [],
		};
	}

	public getParserFor(source: Source){
		const config = this.getConfigFor(source.filename);
		return new Parser(config);
	}

	/**
	 * Get configuration for given filename.
	 */
	getConfigFor(filename: string): Config {
		const loader = new ConfigLoader();
		const config = loader.fromTarget(filename);
		return this.globalConfig.merge(config);
	}
}

export default HtmlValidate;
