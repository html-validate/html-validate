import fs from "fs";
import { Source } from "../context";
import { NestedError } from "../error";
import { MetaTable } from "../meta";
import { Plugin } from "../plugin";
import { TransformContext, Transformer } from "../transform";
import { RuleOptions } from "./config-data";
import { Severity } from "./severity";

export interface TransformerEntry {
	pattern: RegExp;
	name: string;
	fn: Transformer;
}

export interface ResolvedConfigData {
	metaTable: MetaTable;
	plugins: Plugin[];
	rules: Map<string, [Severity, RuleOptions]>;
	transformers: TransformerEntry[];
}

/**
 * A resolved configuration is a normalized configuration with all extends,
 * plugins etc resolved.
 */
export class ResolvedConfig {
	private metaTable: MetaTable;
	private plugins: Plugin[];
	private rules: Map<string, [Severity, RuleOptions]>;
	private transformers: TransformerEntry[];

	public constructor({ metaTable, plugins, rules, transformers }: ResolvedConfigData) {
		this.metaTable = metaTable;
		this.plugins = plugins;
		this.rules = rules;
		this.transformers = transformers;
	}

	public getMetaTable(): MetaTable {
		return this.metaTable;
	}

	public getPlugins(): Plugin[] {
		return this.plugins;
	}

	public getRules(): Map<string, [Severity, RuleOptions]> {
		return this.rules;
	}

	/**
	 * Transform a source.
	 *
	 * When transforming zero or more new sources will be generated.
	 *
	 * @param source - Current source to transform.
	 * @param filename - If set it is the filename used to match
	 * transformer. Default is to use filename from source.
	 * @returns A list of transformed sources ready for validation.
	 */
	public transformSource(source: Source, filename?: string): Source[] {
		const transformer = this.findTransformer(filename || source.filename);
		const context: TransformContext = {
			hasChain: (filename: string): boolean => {
				return !!this.findTransformer(filename);
			},
			chain: (source: Source, filename: string) => {
				return this.transformSource(source, filename);
			},
		};
		if (transformer) {
			try {
				return Array.from(transformer.fn.call(context, source), (cur: Source) => {
					/* keep track of which transformers that has been run on this source
					 * by appending this entry to the transformedBy array */
					cur.transformedBy = cur.transformedBy || [];
					cur.transformedBy.push(transformer.name);
					return cur;
				});
			} catch (err: any) {
				throw new NestedError(`When transforming "${source.filename}": ${err.message}`, err);
			}
		} else {
			return [source];
		}
	}

	/**
	 * Wrapper around [[transformSource]] which reads a file before passing it
	 * as-is to transformSource.
	 *
	 * @param source - Filename to transform (according to configured
	 * transformations)
	 * @returns A list of transformed sources ready for validation.
	 */
	public transformFilename(filename: string): Source[] {
		const data = fs.readFileSync(filename, { encoding: "utf8" });
		const source: Source = {
			data,
			filename,
			line: 1,
			column: 1,
			offset: 0,
			originalData: data,
		};
		return this.transformSource(source);
	}

	/**
	 * Returns true if a transformer matches given filename.
	 */
	public canTransform(filename: string): boolean {
		const entry = this.findTransformer(filename);
		return !!entry;
	}

	private findTransformer(filename: string): TransformerEntry | null {
		const match = this.transformers.find((entry: TransformerEntry) => entry.pattern.test(filename));
		return match ?? null;
	}
}
