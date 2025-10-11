import { type Location } from "../context";
import { type RuleBlocker } from "../engine";
import { type DOMNodeCache } from "./cache";
import { NodeType } from "./nodetype";

/**
 * @public
 */

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

/**
 * @public
 */
export class DOMNode {
	public readonly nodeName: string;
	public readonly nodeType: NodeType;
	public readonly childNodes: DOMNode[];

	public readonly location: Location;

	/**
	 * @internal
	 */
	public readonly unique: DOMInternalID;

	private cache: null | Map<string | number | symbol, any>;

	/**
	 * Set of disabled rules for this node.
	 *
	 * Rules disabled by using directives are added here.
	 */
	private disabledRules: Set<string>;

	/**
	 * Set of blocked rules for this node.
	 *
	 * Rules blocked by using directives are added here.
	 */
	private blockedRules: Map<string, RuleBlocker[]>;

	/**
	 * Create a new DOMNode.
	 *
	 * @internal
	 * @param nodeType - What node type to create.
	 * @param nodeName - What node name to use. For `HtmlElement` this corresponds
	 * to the tagName but other node types have specific predefined values.
	 * @param location - Source code location of this node.
	 */
	public constructor(nodeType: NodeType, nodeName: string | undefined, location: Location) {
		this.nodeType = nodeType;
		this.nodeName = nodeName ?? DOCUMENT_NODE_NAME;
		this.location = location;
		this.disabledRules = new Set();
		this.blockedRules = new Map();
		this.childNodes = [];
		this.unique = counter++;
		this.cache = null;
	}

	/**
	 * Enable cache for this node.
	 *
	 * Should not be called before the node and all children are fully constructed.
	 *
	 * @internal
	 */
	public cacheEnable(enable: boolean = true): void {
		this.cache = enable ? new Map() : null;
	}

	/**
	 * Fetch cached value from this DOM node.
	 *
	 * Cache is not enabled until `cacheEnable()` is called by [[Parser]] (when
	 * the element is fully constructed).
	 *
	 * @returns value or `undefined` if the value doesn't exist.
	 */
	public cacheGet<K extends keyof DOMNodeCache>(key: K): DOMNodeCache[K] | undefined;
	public cacheGet(key: string | number | symbol): any | undefined;
	public cacheGet(key: string | number | symbol): any | undefined {
		if (this.cache) {
			return this.cache.get(key);
		} else {
			return undefined;
		}
	}

	/**
	 * Store a value in cache.
	 *
	 * @returns the value itself is returned.
	 */
	public cacheSet<K extends keyof DOMNodeCache>(key: K, value: DOMNodeCache[K]): DOMNodeCache[K];
	public cacheSet<T>(key: string | number | symbol, value: T): T;
	public cacheSet<T>(key: string | number | symbol, value: T): T {
		if (this.cache) {
			this.cache.set(key, value);
		}
		return value;
	}

	/**
	 * Remove a value by key from cache.
	 *
	 * @returns `true` if the entry existed and has been removed.
	 */
	public cacheRemove(key: string | number | symbol): boolean {
		if (this.cache) {
			return this.cache.delete(key);
		} else {
			return false;
		}
	}

	/**
	 * Check if key exists in cache.
	 */
	public cacheExists(key: string | number | symbol): boolean {
		return Boolean(this.cache?.has(key));
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
		const oldParent = node._setParent(this);
		if (oldParent && this.isSameNode(oldParent)) {
			return;
		}

		this.childNodes.push(node);
		if (oldParent) {
			oldParent._removeChild(node);
		}
	}

	/**
	 * Insert a node before a reference node.
	 *
	 * @internal
	 */
	public insertBefore(node: DOMNode, reference: DOMNode | null): void {
		const index = reference ? this.childNodes.findIndex((it) => it.isSameNode(reference)) : -1;
		if (index >= 0) {
			this.childNodes.splice(index, 0, node);
		} else {
			this.childNodes.push(node);
		}
		const oldParent = node._setParent(this);
		if (oldParent) {
			oldParent._removeChild(node);
		}
	}

	public isRootElement(): boolean {
		return this.nodeType === NodeType.DOCUMENT_NODE;
	}

	/**
	 * Tests if two nodes are the same (references the same object).
	 *
	 * @since v4.11.0
	 */
	public isSameNode(otherNode: DOMNode): boolean {
		return this.unique === otherNode.unique;
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
	 * @internal
	 */
	public removeChild<T extends DOMNode>(node: T): T {
		this._removeChild(node);
		node._setParent(null);
		return node;
	}

	/**
	 * Block a rule for this node.
	 *
	 * @internal
	 */
	public blockRule(ruleId: string, blocker: RuleBlocker): void {
		const current = this.blockedRules.get(ruleId);
		if (current) {
			current.push(blocker);
		} else {
			this.blockedRules.set(ruleId, [blocker]);
		}
	}

	/**
	 * Blocks multiple rules.
	 *
	 * @internal
	 */
	public blockRules(rules: string[] | Set<string>, blocker: RuleBlocker): void {
		for (const rule of rules) {
			this.blockRule(rule, blocker);
		}
	}

	/**
	 * Disable a rule for this node.
	 *
	 * @internal
	 */
	public disableRule(ruleId: string): void {
		this.disabledRules.add(ruleId);
	}

	/**
	 * Disables multiple rules.
	 *
	 * @internal
	 */
	public disableRules(rules: string[] | Set<string>): void {
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
	 *
	 * @internal
	 */
	public ruleEnabled(ruleId: string): boolean {
		return !this.disabledRules.has(ruleId);
	}

	/**
	 * Test if a rule is blocked for this node.
	 *
	 * @internal
	 */
	public ruleBlockers(ruleId: string): RuleBlocker[] {
		return this.blockedRules.get(ruleId) ?? [];
	}

	public generateSelector(): string | null {
		return null;
	}

	/**
	 * @internal
	 *
	 * @returns Old parent, if set.
	 */
	public _setParent(_node: DOMNode | null): DOMNode | null {
		/* do nothing (as DOMNodes cannot have parents in this implementation yet) */
		return null;
	}

	private _removeChild(node: DOMNode): void {
		const index = this.childNodes.findIndex((it) => it.isSameNode(node));
		if (index >= 0) {
			this.childNodes.splice(index, 1);
		} else {
			throw new Error("DOMException: _removeChild(..) could not find child to remove");
		}
	}
}
