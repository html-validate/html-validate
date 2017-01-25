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
		return Object.assign({}, this.config.rules || {});
	}
}

module.exports = Config;
