import * as ESTree from 'estree';
import { Source } from '../context';

const espree = require("espree");
const fs = require('fs');
const walk = require("acorn/dist/walk");

/* espree puts location information a bit different than estree */
declare module 'estree' {
	interface TemplateElement {
		start: number;
		end: number;
	}
}

function joinTemplateLiteral(nodes: ESTree.TemplateElement[]): string {
	let offset = nodes[0].start;
	let output = '';
	for (const node of nodes){
		output += ' '.repeat(node.start - offset);
		output += node.value.raw;
		offset = node.end;
	}
	return output;
}

function extractLiteral(node: ESTree.Expression | ESTree.Pattern): Source {
	switch (node.type){
	case 'Literal':
		return {
			data: node.value.toString(),
			filename: null,
			line: node.loc.start.line,
			column: node.loc.start.column + 1,
		};
	case 'TemplateLiteral':
		return {
			data: joinTemplateLiteral(node.quasis),
			filename: null,
			line: node.loc.start.line,
			column: node.loc.start.column + 1,
		};
	case 'TaggedTemplateExpression':
		return {
			data: joinTemplateLiteral(node.quasi.quasis),
			filename: null,
			line: node.quasi.loc.start.line,
			column: node.quasi.loc.start.column + 1,
		};
	default:
		throw Error(`Unhandled node type "${node.type}" in extractLiteral`);
	}
}

function compareKey(node: ESTree.Expression, key: string){
	switch (node.type){
	case "Identifier":
		return node.name === key;
	default:
		throw Error(`Unhandled node type "${node.type}" in compareKey`);
	}
}

export class TemplateExtractor {
	ast: ESTree.Program;

	private constructor(ast: ESTree.Program){
		this.ast = ast;
	}

	static fromFilename(filename: string): TemplateExtractor {
		const source = fs.readFileSync(filename);
		const ast = espree.parse(source, {
			ecmaVersion: 2017,
			sourceType: "module",
			loc: true,
		});
		return new TemplateExtractor(ast);
	}

	static fromString(source: string): TemplateExtractor {
		const ast = espree.parse(source, {
			ecmaVersion: 2017,
			sourceType: "module",
			loc: true,
		});
		return new TemplateExtractor(ast);
	}

	extractObjectProperty(key: string): Source[] {
		const result: Source[] = [];
		walk.simple(this.ast, {
			Property(node: ESTree.Property){
				if (compareKey(node.key, key)){
					result.push(extractLiteral(node.value));
				}
			},
		});
		return result;
	}
}
