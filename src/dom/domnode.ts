import { Location } from "../context";
import { NodeType } from "./nodetype";
import { DOMNodeCache } from "./cache";

export type DOMInternalID = number;

const DOCUMENT_NODE_NAME = "#document";
const TEXT_CONTENT = Symbol("textContent");

declare module "./cache" {
	export interface DOMNodeCache {
		[TEXT_CONTENT]: string;
	}
}

let counter = 0;

/* istanbul ignore next: only for testing */
export function reset(): void {
	counter = 0;
}

export class DOMNode {
	public readonly nodeName: string;
	public readonly nodeType: NodeType;
	public readonly childNodes: DOMNode[];

	public readonly location: Location | null;
	public readonly unique: DOMInternalID;

	private readonly cache: Map<string | number | symbol, any>;

	/**
	 * Set of disabled rules for this node.
	 *
	 * Rules disabled by using directives are added here.
	 */
	private disabledRules: Set<string>;

	/**
	 * Create a new DOMNode.
	 *
	 * @param nodeType - What node type to create.
	 * @param nodeName - What node name to use. For `HtmlElement` this corresponds
	 * to the tagName but other node types have specific predefined values.
	 * @param location - Source code location of this node.
	 */
	public constructor(nodeType: NodeType, nodeName: string, location: Location | null = null) {
		this.nodeType = nodeType;
		this.nodeName = nodeName || DOCUMENT_NODE_NAME;
		this.location = location;
		this.disabledRules = new Set();
		this.childNodes = [];
		this.unique = counter++;
		this.cache = new Map();
	}

	/**
	 * Fetch cached value from this DOM node.
	 *
	 * @returns value or `undefined` if the value doesn't exist.
	 */
	public cacheGet<K extends keyof DOMNodeCache>(key: K): DOMNodeCache[K] | undefined;
	public cacheGet(key: string | number | symbol): any | undefined;
	public cacheGet(key: string | number | symbol): any | undefined {
		return this.cache.get(key);
	}

	/**
	 * Store a value in cache.
	 *
	 * @returns the value itself is returned.
	 */
	public cacheSet<K extends keyof DOMNodeCache>(key: K, value: DOMNodeCache[K]): DOMNodeCache[K];
	public cacheSet<T>(key: string | number | symbol, value: T): T;
	public cacheSet<T>(key: string | number | symbol, value: T): T {
		this.cache.set(key, value);
		return value;
	}

	/**
	 * Remove a value by key from cache.
	 */
	public cacheRemove<K extends keyof DOMNodeCache>(key: K): boolean;
	public cacheRemove(key: string | number | symbol): boolean;
	public cacheRemove(key: string | number | symbol): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Check if key exists in cache.
	 */
	public cacheExists<K extends keyof DOMNodeCache>(key: K): boolean;
	public cacheExists(key: string | number | symbol): boolean;
	public cacheExists(key: string | number | symbol): boolean {
		return this.cache.has(key);
	}

	/**
	 * Get the text (recursive) from all child nodes.
	 */
	public get textContent(): string {
		const cached = this.cacheGet(TEXT_CONTENT);
		if (cached) {
			return cached;
		}
		const text = this.childNodes.map((node) => node.textContent).join("");
		this.cacheSet(TEXT_CONTENT, text);
		return text;
	}

	public append(node: DOMNode): void {
		this.childNodes.push(node);
	}

	public isRootElement(): boolean {
		return this.nodeType === NodeType.DOCUMENT_NODE;
	}

	/**
	 * Returns a DOMNode representing the first direct child node or `null` if the
	 * node has no children.
	 */
	public get firstChild(): DOMNode {
		return this.childNodes[0] || null;
	}

	/**
	 * Returns a DOMNode representing the last direct child node or `null` if the
	 * node has no children.
	 */
	public get lastChild(): DOMNode {
		return this.childNodes[this.childNodes.length - 1] || null;
	}

	/**
	 * Disable a rule for this node.
	 */
	public disableRule(ruleId: string): void {
		this.disabledRules.add(ruleId);
	}

	/**
	 * Disables multiple rules.
	 */
	public disableRules(rules: string[]): void {
		for (const rule of rules) {
			this.disableRule(rule);
		}
	}

	/**
	 * Enable a previously disabled rule for this node.
	 */
	public enableRule(ruleId: string): void {
		this.disabledRules.delete(ruleId);
	}

	/**
	 * Enables multiple rules.
	 */
	public enableRules(rules: string[]): void {
		for (const rule of rules) {
			this.enableRule(rule);
		}
	}

	/**
	 * Test if a rule is enabled for this node.
	 */
	public ruleEnabled(ruleId: string): boolean {
		return !this.disabledRules.has(ruleId);
	}

	public generateSelector(): string | null {
		return null;
	}
}
