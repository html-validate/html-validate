const path = require('path');

const voidElements = [
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'menuitem',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
];

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
	html: any;
	extends: Array<string>;
	rules: any;
}

class Config {
	config: ConfigData;

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

		/* process and extended configs */
		const self = this;
		this.config.extends.forEach(function(ref: string){
			const base = Config.fromFile(ref);
			self.config = base.merge(self.config);
		});
	}

	private loadDefaults(){
		this.config = {
			html: {
				voidElements,
			},
			extends: [],
			rules: {},
		};
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

	isVoidElement(tagName: string): boolean {
		return this.config.html.voidElements.indexOf(tagName.toLowerCase()) !== -1;
	}
}

export default Config;
