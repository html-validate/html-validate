import * as ESTree from 'estree';

const espree = require("espree");
const fs = require('fs');
const walk = require("acorn/dist/walk");

function extractLiteral(node: ESTree.Expression | ESTree.Pattern): string {
	switch (node.type){
	case 'Literal':
		return node.value.toString();
	case 'TemplateLiteral':
		return node.quasis.map((quasis: ESTree.TemplateElement) => {
			return quasis.value.raw;
		}).join('');
	case 'TaggedTemplateExpression':
		return node.quasi.quasis.map((quasis: ESTree.TemplateElement) => {
			return quasis.value.raw;
		}).join('');
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
		});
		return new TemplateExtractor(ast);
	}

	static fromString(source: string): TemplateExtractor {
		const ast = espree.parse(source, {
			ecmaVersion: 2017,
			sourceType: "module",
		});
		return new TemplateExtractor(ast);
	}

	extractObjectProperty(key: string): string[] {
		const result: string[] = [];
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
