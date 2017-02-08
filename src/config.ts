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

function deepMerge(dst: Object, src: Object){
	for ( let key of Object.keys(src) ){
		if ( dst.hasOwnProperty(key) && typeof(dst[key]) === 'object' && typeof(src[key]) === 'object' ){
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
	if ( typeof(value) === 'number' ){
		return value;
	} else {
		return parseSeverityLut.indexOf(value.toLowerCase());
	}
}

class Config {
	config: any;

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
		const json = require(filename);

		/* expand any relative paths */
		json.extends = (json.extends||[]).map(function(ref){
			return Config.expandRelative(ref, path.dirname(filename));
		});

		return new Config(json);
	}

	constructor(options?: any){
		this.config = {};
		this.loadDefaults();
		this.merge(options || {});

		/* process and extended configs */
		const self = this;
		this.config.extends.forEach(function(ref){
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
		if ( src[0] === '.' ){
			return path.normalize(`${currentPath}/${src}`);
		}
		return src;
	}

	private merge(config){
		deepMerge(this.config, config);
		return this.config;
	}

	get(){
		return Object.assign({}, this.config);
	}

	getRules(){
		let rules = Object.assign({}, this.config.rules || {});
		for ( let name in rules ){
			let options = rules[name];
			if ( !Array.isArray(options) ){
				options = [options, {}];
			} else if ( options.length === 1 ){
				options.push({});
			}
			options[0] = parseSeverity(options[0]);
			rules[name] = options;
		}
		return rules;
	}
}

export default Config;
