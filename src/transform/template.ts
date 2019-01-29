import * as ESTree from "estree";
import { Source } from "../context";

const espree = require("espree");
const fs = require("fs");
const walk = require("acorn-walk");

/* espree puts location information a bit different than estree */
declare module "estree" {
	interface TemplateElement {
		start: number;
		end: number;
	}
}

function joinTemplateLiteral(nodes: ESTree.TemplateElement[]): string {
	let offset = nodes[0].start;
	let output = "";
	for (const node of nodes) {
		output += " ".repeat(node.start - offset);
		output += node.value.raw;
		offset = node.end;
	}
	return output;
}

function extractLiteral(
	node:
		| ESTree.Expression
		| ESTree.Pattern
		| ESTree.Literal
		| ESTree.BlockStatement,
	filename: string
): Source {
	switch (node.type) {
		/* ignored nodes */
		case "FunctionExpression":
			return null;

		case "Literal":
			return {
				data: node.value.toString(),
				filename: null,
				line: node.loc.start.line,
				column: node.loc.start.column + 1,
			};

		case "TemplateLiteral":
			return {
				data: joinTemplateLiteral(node.quasis),
				filename: null,
				line: node.loc.start.line,
				column: node.loc.start.column + 1,
			};

		case "TaggedTemplateExpression":
			return {
				data: joinTemplateLiteral(node.quasi.quasis),
				filename: null,
				line: node.quasi.loc.start.line,
				column: node.quasi.loc.start.column + 1,
			};

		case "ArrowFunctionExpression": {
			const whitelist = ["Literal", "TemplateLiteral"];
			if (whitelist.includes(node.body.type)) {
				return extractLiteral(node.body, filename);
			} else {
				return null;
			}
		}

		/* istanbul ignore next: this only provides a better error, all currently known nodes are tested */
		default: {
			const loc = node.loc.start;
			const context = `${filename}:${loc.line}:${loc.column}`;
			throw Error(
				`Unhandled node type "${node.type}" at "${context}" in extractLiteral`
			);
		}
	}
}

function compareKey(node: ESTree.Expression, key: string, filename: string) {
	switch (node.type) {
		case "Identifier":
			return node.name === key;

		case "Literal":
			return node.value === key;

		/* istanbul ignore next: this only provides a better error, all currently known nodes are tested */
		default: {
			const loc = node.loc.start;
			const context = `${filename}:${loc.line}:${loc.column}`;
			throw Error(
				`Unhandled node type "${node.type}" at "${context}" in compareKey`
			);
		}
	}
}

export class TemplateExtractor {
	ast: ESTree.Program;
	filename: string;

	private constructor(ast: ESTree.Program, filename: string) {
		this.ast = ast;
		this.filename = filename;
	}

	static fromFilename(filename: string): TemplateExtractor {
		const source = fs.readFileSync(filename);
		const ast = espree.parse(source, {
			ecmaVersion: 2017,
			sourceType: "module",
			loc: true,
		});
		return new TemplateExtractor(ast, filename);
	}

	static fromString(source: string, filename?: string): TemplateExtractor {
		const ast = espree.parse(source, {
			ecmaVersion: 2017,
			sourceType: "module",
			loc: true,
		});
		return new TemplateExtractor(ast, filename || "inline");
	}

	static createSource(filename: string): Source[] {
		const data = fs.readFileSync(filename, "utf-8");
		return [
			{
				column: 1,
				data,
				filename,
				line: 1,
			},
		];
	}

	extractObjectProperty(key: string): Source[] {
		const result: Source[] = [];
		const filename = this.filename;
		walk.simple(this.ast, {
			Property(node: ESTree.Property) {
				if (compareKey(node.key, key, filename)) {
					const source = extractLiteral(node.value, filename);
					if (source) {
						source.filename = filename;
						result.push(source);
					}
				}
			},
		});
		return result;
	}
}
