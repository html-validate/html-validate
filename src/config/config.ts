import { MetaTable } from '../meta';
import { ConfigData, TransformMap } from './config-data';
import { Source } from '../context';
import { RuleConstructor } from '../rule';
import { ElementTable } from '../meta/element';
import defaultConfig from './default';

type Transformer = {
	pattern: RegExp;
	fn: (filename: string) => Source[];
};

interface Plugin {
	rules: { [key: string]: RuleConstructor };
}

const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');

const recommended = require('./recommended');
const document = require('./document');

function parseSeverity(value: string | number){
	if (typeof value === 'number'){
		return value;
	}
	switch (value){
	case 'off':
		return 0;
	/* istanbul ignore next: deprecated code which will be removed later */
	case 'disable':
		// eslint-disable-next-line no-console
		console.warn(`Deprecated alias "disabled" will be removed, replace with severity "off"`);
		return 0;
	case 'warn':
		return 1;
	case 'error':
		return 2;
	default:
		throw new Error(`Invalid severity "${value}"`);
	}
}

export class Config {
	private config: ConfigData;
	protected metaTable: MetaTable;
	protected plugins: Plugin[];
	protected transformers: Transformer[];
	protected rootDir: string;

	public static readonly SEVERITY_DISABLED = 0;
	public static readonly SEVERITY_WARN = 1;
	public static readonly SEVERITY_ERROR = 2;

	public static empty(): Config {
		return new Config({
			extends: [],
			rules: {},
			plugins: [],
			transform: {},
		});
	}

	public static fromObject(options: ConfigData): Config {
		return new Config(options);
	}

	public static fromFile(filename: string): Config {
		switch (filename){
		case 'htmlvalidate:recommended': return Config.fromObject(recommended);
		case 'htmlvalidate:document': return Config.fromObject(document);
		}

		const json = require(filename);

		/* expand any relative paths */
		for (const key of ['extends', 'elements', 'plugins']){
			if (!json[key]) continue;
			json[key] = json[key].map((ref: string) => {
				return Config.expandRelative(ref, path.dirname(filename));
			});
		}

		return new Config(json);
	}

	public static defaultConfig(): Config {
		return new Config(defaultConfig);
	}

	constructor(options?: ConfigData){
		this.config = {
			extends: [],
			plugins: [],
			rules: {},
			transform: {},
		};
		this.mergeInternal(options || {});
		this.metaTable = null;
		this.rootDir = this.findRootDir();

		/* process extended configs */
		for (const extend of this.config.extends){
			const base = Config.fromFile(extend);
			this.config = base.mergeInternal(this.config);
		}
	}

	init(){
		/* load plugins */
		this.plugins = this.loadPlugins(this.config.plugins || []);

		/* precompile transform patterns */
		this.transformers = this.precompileTransformers(this.config.transform || {});
	}

	/**
	 * Returns a new configuration as a merge of the two. Entries from the passed
	 * object takes priority over this object.
	 *
	 * @param {Config} rhs - Configuration to merge with this one.
	 */
	public merge(rhs: Config){
		return new Config(this.mergeInternal(rhs.config));
	}

	getMetaTable(){
		/* use cached table if it exists */
		if (this.metaTable){
			return this.metaTable;
		}

		this.metaTable = new MetaTable();
		const source = this.config.elements || ['html5'];
		const root = path.resolve(__dirname, '..', '..');

		/* load from all entries */
		for (const entry of source){
			/* load meta directly from entry */
			if (typeof entry !== 'string'){
				this.metaTable.loadFromObject(entry as ElementTable);
				continue;
			}

			/* try searching builtin metadata */
			const filename = `${root}/elements/${entry}.json`;
			if (fs.existsSync(filename)){
				this.metaTable.loadFromFile(filename);
				continue;
			}

			/* try as regular file */
			if (fs.existsSync(entry)){
				this.metaTable.loadFromFile(entry);
				continue;
			}

			/* assume it is loadable with require() */
			this.metaTable.loadFromObject(require(entry));
		}

		this.metaTable.init();
		return this.metaTable;
	}

	static expandRelative(src: string, currentPath: string): string {
		if (src[0] === '.'){
			return path.normalize(`${currentPath}/${src}`);
		}
		return src;
	}

	private mergeInternal(config: ConfigData): ConfigData {
		this.config = deepmerge(this.config, config);
		return this.config;
	}

	get(): ConfigData {
		return Object.assign({}, this.config);
	}

	getRules(){
		const rules = Object.assign({}, this.config.rules || {});
		for (const name in rules){
			let options = rules[name];
			if (!Array.isArray(options)){
				options = [options, {}];
			} else if (options.length === 1){
				options = [options[0], {}];
			}

			options[0] = parseSeverity(options[0]);
			rules[name] = options;
		}
		return rules;
	}

	public getPlugins(): Plugin[] {
		return this.plugins;
	}

	private loadPlugins(plugins: string[]): Plugin[] {
		return plugins.map((name: string) => {
			return require(name);
		});
	}

	/**
	 * Transform a source file.
	 */
	public transform(filename: string): Source[] {
		const transformer = this.findTransformer(filename);
		if (transformer){
			return transformer.fn(filename);
		} else {
			return [{
				data: fs.readFileSync(filename, {encoding: 'utf8'}),
				filename,
				line: 1,
				column: 1,
			}];
		}
	}

	private findTransformer(filename: string): Transformer|null {
		return this.transformers.find((entry: Transformer) => entry.pattern.test(filename));
	}

	private precompileTransformers(transform: TransformMap): Transformer[] {
		return Object.entries(transform).map(([pattern, module]) => {
			return {
				pattern: new RegExp(pattern),
				fn: require(module.replace('<rootDir>', this.rootDir)),
			} as Transformer;
		});
	}

	protected findRootDir(){
		/* try to locate package.json */
		let current = process.cwd();
		for (;;){
			const search = path.join(current, 'package.json');
			if (fs.existsSync(search)){
				return current;
			}

			/* get the parent directory */
			const child = current;
			current = path.dirname(current);

			/* stop if this is the root directory */
			if (current === child){
				break;
			}
		}

		/* default to working directory if no package.json is found */
		return process.cwd();
	}
}
