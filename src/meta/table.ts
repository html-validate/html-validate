import { MetaElement, ElementTable } from './element';

const allowedKeys = [
	'tagName',
	'metadata',
	'flow',
	'sectioning',
	'heading',
	'phrasing',
	'embedded',
	'interactive',
	'deprecated',
	'void',
];

export class MetaTable {
	elements: ElementTable;

	constructor(){
		this.elements = {};
	}

	loadFromObject(obj: ElementTable){
		for (const key of Object.keys(obj)) {
			this.addEntry(key, obj[key]);
		}
	}

	loadFromFile(filename: string){
		this.loadFromObject(require(filename));
	}

	getMetaFor(tagName: string): MetaElement {
		return this.elements[tagName] ? this.elements[tagName] : null;
	}

	private addEntry(tagName: string, entry: MetaElement): void {
		for (const key of Object.keys(entry)) {
			if (allowedKeys.indexOf(key) === -1){
				throw new Error(`Metadata for <${tagName}> contains unknown property "${key}"`);
			}
		}

		this.elements[tagName] = Object.assign({
			tagName,
			void: false,
		}, entry);
	}
}
