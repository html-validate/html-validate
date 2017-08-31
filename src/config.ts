import { MetaTable } from './meta';
const path = require('path');
const glob = require('glob');

const recommended = {
	rules: {
		'attr-quotes': 'error',
		'button-type': 'error',
		'close-attr': 'error',
		'close-order': 'error',
		'no-trailing-whitespace': 'error',
	},
};

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

interface ConfigData {
	extends: Array<string>;
	rules: any;
}

export class Config {
	config: ConfigData;
	metaTable: MetaTable;

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
		if (filename === 'htmllint:recommended'){
			return Config.fromObject(recommended);
		}

		const json = require(filename);

		/* expand any relative paths */
		json.extends = (json.extends || []).map(function(ref: string){
			return Config.expandRelative(ref, path.dirname(filename));
		});

		return new Config(json);
	}

	constructor(options?: any){
		this.loadDefaults();
		this.merge(options || {});
		this.metaTable = null;

		/* process and extended configs */
		const self = this;
		this.config.extends.forEach(function(ref: string){
			const base = Config.fromFile(ref);
			self.config = base.merge(self.config);
		});
	}

	private loadDefaults(){
		this.config = {
			extends: [],
			rules: {},
		};
	}

	getMetaTable(){
		if (!this.metaTable){
			this.metaTable = new MetaTable();
			const root = path.resolve(__dirname, '..');
			for (const filename of glob.sync(`${root}/elements/*.json`)){
				this.metaTable.loadFromFile(filename);
			}
		}
		return this.metaTable;
	}

	static expandRelative(src: string, currentPath: string): string {
		if (src[0] === '.'){
			return path.normalize(`${currentPath}/${src}`);
		}
		return src;
	}

	private merge(config: Object): ConfigData {
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

export default Config;
