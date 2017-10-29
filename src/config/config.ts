import { MetaTable } from '../meta';
import { ConfigData } from './config-data';

const fs = require('fs');
const path = require('path');

const recommended = require('./recommended');

function deepMerge(dst: any, src: any){
	for (const key of Object.keys(src)){
		if (dst.hasOwnProperty(key) && typeof dst[key] === 'object' && typeof src[key] === 'object'){
			deepMerge(dst[key], src[key]);
		} else {
			dst[key] = src[key];
		}
	}
	return dst;
}

const parseSeverityLut = [
	'disable',
	'warn',
	'error',
];

function parseSeverity(value: string | number){
	if (typeof value === 'number'){
		return value;
	} else {
		return parseSeverityLut.indexOf(value.toLowerCase());
	}
}

export class Config {
	private config: ConfigData;
	protected metaTable: MetaTable;

	public static readonly SEVERITY_DISABLED = 0;
	public static readonly SEVERITY_WARN = 1;
	public static readonly SEVERITY_ERROR = 2;

	static empty(): Config {
		return new Config();
	}

	static fromObject(options: Object): Config {
		return new Config(options);
	}

	static fromFile(filename: string): Config {
		if (filename === 'htmlvalidate:recommended'){
			return Config.fromObject(recommended);
		}

		const json = require(filename);

		/* expand any relative paths */
		for (const key of ['extends', 'elements']){
			if (!json[key]) continue;
			json[key] = json[key].map((ref: string) => {
				return Config.expandRelative(ref, path.dirname(filename));
			});
		}

		return new Config(json);
	}

	constructor(options?: any){
		this.loadDefaults();
		this.mergeInternal(options || {});
		this.metaTable = null;

		/* process and extended configs */
		const self = this;
		this.config.extends.forEach(function(ref: string){
			const base = Config.fromFile(ref);
			self.config = base.mergeInternal(self.config);
		});
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

	private loadDefaults(){
		this.config = {
			extends: [],
			rules: {},
		};
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

			/* try searching builtin metadata */
			const filename = `${root}/elements/${entry}.json`;
			if (fs.existsSync(filename)){
				this.metaTable.loadFromFile(filename);
				continue;
			}

			/* assume it is loadable with require() */
			this.metaTable.loadFromObject(require(entry));
		}

		return this.metaTable;
	}

	static expandRelative(src: string, currentPath: string): string {
		if (src[0] === '.'){
			return path.normalize(`${currentPath}/${src}`);
		}
		return src;
	}

	private mergeInternal(config: Object): ConfigData {
		deepMerge(this.config, config);
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
				options.push({});
			}
			options[0] = parseSeverity(options[0]);
			rules[name] = options;
		}
		return rules;
	}
}
