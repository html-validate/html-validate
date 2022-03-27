declare module "espree" {
	import type ESTree from "estree";

	export type TemplateElement = ESTree.TemplateElement;
	export type Expression = ESTree.Expression;
	export type PrivateIdentifier = ESTree.PrivateIdentifier;
	export type Program = ESTree.Program;
	export type Property = ESTree.Property;
	export type Pattern = ESTree.Pattern;
	export type Literal = ESTree.Literal;
	export type BlockStatement = ESTree.BlockStatement;

	export interface EcmaFeatures {
		jsx?: boolean;
		globalReturn?: boolean;
		impliedStrict?: boolean;
	}

	export interface ParseOptions {
		range?: boolean;
		loc?: boolean;
		comment?: boolean;
		tokens?: boolean;
		ecmaVersion?: number | "latest";
		allowReserved?: boolean;
		sourceType?: "script" | "module" | "commonjs";
		ecmaFeatures?: EcmaFeatures;
	}

	export function parse(source: string, options?: ParseOptions): Program;
}
