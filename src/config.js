'use strict';

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

function deepMerge(dst, src){
	for ( let key of Object.keys(src) ){
		if ( dst.hasOwnProperty(key) && typeof(dst[key]) === 'object' && typeof(src[key]) === 'object' ){
			deepMerge(dst[key], src[key]);
		} else {
			dst[key] = src[key];
		}
	}
	return dst;
}

parseSeverity.lut = [
	'disable',
	'warn',
	'error',
];

function parseSeverity(value){
	if ( typeof(value) === 'number' ){
		return value;
	} else {
		return parseSeverity.lut.indexOf(value.toLowerCase());
	}
}

class Config {
	constructor(options){
		this.config = {};
		this.loadDefaults();
		this.merge(options || {});
	}

	loadDefaults(){
		this.config = {
			html: {
				voidElements,
			},
			rules: {},
		};
	}

	merge(config){
		deepMerge(this.config, config);
	}

	get(){
		return Object.assign({}, this.config);
	}

	getRules(){
		let rules = Object.assign({}, this.config.rules || {});
		for ( let name in rules ){
			rules[name] = parseSeverity(rules[name]);
		}
		return rules;
	}
}

Config.SEVERITY_DISABLED = 0;
Config.SEVERITY_WARN = 1;
Config.SEVERITY_ERROR = 2;

module.exports = Config;
