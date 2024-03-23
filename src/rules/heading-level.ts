import { type Location, sliceLocation } from "../context";
import { type HtmlElement, Pattern } from "../dom";
import { type DOMInternalID } from "../dom/domnode";
import { type SelectorContext } from "../dom/selector-context";
import { type TagEndEvent, type TagReadyEvent, type TagStartEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	allowMultipleH1: boolean;
	minInitialRank: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "any" | false;
	sectioningRoots: string[];
}

interface SectioningRoot {
	node: DOMInternalID | null;
	current: number;
	h1Count: number;
}

const defaults: RuleOptions = {
	allowMultipleH1: false,
	minInitialRank: "h1",
	sectioningRoots: ["dialog", '[role="dialog"]', '[role="alertdialog"]'],
};

function isRelevant(event: TagStartEvent): boolean {
	const node = event.target;
	return Boolean(node.meta && node.meta.heading);
}

function extractLevel(node: HtmlElement): number | null {
	const match = node.tagName.match(/^[hH](\d)$/);
	if (match) {
		return parseInt(match[1], 10);
	} else {
		return null;
	}
}

function parseMaxInitial(value: string | false): number {
	if (value === false || value === "any") {
		return 6;
	}
	const match = value.match(/^h(\d)$/);
	/* istanbul ignore next: should never happen, schema validation should catch invalid values */
	if (!match) {
		return 1;
	}
	return parseInt(match[1], 10);
}

export default class HeadingLevel extends Rule<void, RuleOptions> {
	private minInitialRank: number;
	private sectionRoots: Pattern[];
	private stack: SectioningRoot[] = [];

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.minInitialRank = parseMaxInitial(this.options.minInitialRank);
		this.sectionRoots = this.options.sectioningRoots.map((it) => new Pattern(it));

		/* add a global sectioning root used by default */
		this.stack.push({
			node: null,
			current: 0,
			h1Count: 0,
		});
	}

	public static schema(): SchemaObject {
		return {
			allowMultipleH1: {
				type: "boolean",
			},
			minInitialRank: {
				enum: ["h1", "h2", "h3", "h4", "h5", "h6", "any", false],
			},
			sectioningRoots: {
				items: {
					type: "string",
				},
				type: "array",
			},
		};
	}

	public documentation(): RuleDocumentation {
		const text: string[] = [];
		const modality = this.minInitialRank > 1 ? "should" : "must";
		text.push(`Headings ${modality} start at <h1> and can only increase one level at a time.`);
		text.push("The headings should form a table of contents and make sense on its own.");
		if (!this.options.allowMultipleH1) {
			text.push("");
			text.push(
				"Under the current configuration only a single <h1> can be present at a time in the document.",
			);
		}
		return {
			description: text.join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:start", isRelevant, (event: TagStartEvent) => {
			this.onTagStart(event);
		});
		this.on("tag:ready", (event: TagReadyEvent) => {
			this.onTagReady(event);
		});
		this.on("tag:close", (event: TagEndEvent) => {
			this.onTagClose(event);
		});
	}

	private onTagStart(event: TagStartEvent): void {
		/* extract heading level from tagName (e.g "h1" -> 1)*/
		const level = extractLevel(event.target);
		if (!level) return;

		/* fetch the current sectioning root */
		const root = this.getCurrentRoot();

		/* do not allow multiple h1 */
		if (!this.options.allowMultipleH1 && level === 1) {
			if (root.h1Count >= 1) {
				const location = sliceLocation(event.location, 1);
				this.report(event.target, `Multiple <h1> are not allowed`, location);
				return;
			}
			root.h1Count++;
		}

		/* allow same level or decreasing to any level (e.g. from h4 to h2) */
		if (level <= root.current) {
			root.current = level;
			return;
		}

		this.checkLevelIncrementation(root, event, level);

		root.current = level;
	}

	/**
	 * Validate heading level was only incremented by one.
	 */
	private checkLevelIncrementation(
		root: SectioningRoot,
		event: TagStartEvent,
		level: number,
	): void {
		const expected = root.current + 1;

		/* check if the new level is the expected one (headings with higher ranks
		 * are skipped already) */
		if (level === expected) {
			return;
		}

		/* if this is the initial heading of the document it is compared to the
		 * minimal allowed (default h1) */
		const isInitial = this.stack.length === 1 && expected === 1;
		if (isInitial && level <= this.minInitialRank) {
			return;
		}

		/* if we reach this far the heading level is not accepted */
		const location = sliceLocation(event.location, 1);
		if (root.current > 0) {
			const expectedTag = `<h${String(expected)}>`;
			const actualTag = `<h${String(level)}>`;
			const msg = `Heading level can only increase by one, expected ${expectedTag} but got ${actualTag}`;
			this.report(event.target, msg, location);
		} else {
			this.checkInitialLevel(event, location, level, expected);
		}
	}

	private checkInitialLevel(
		event: TagStartEvent,
		location: Location,
		level: number,
		expected: number,
	): void {
		const expectedTag = `<h${String(expected)}>`;
		const actualTag = `<h${String(level)}>`;
		if (this.stack.length === 1) {
			const msg =
				this.minInitialRank > 1
					? `Initial heading level must be <h${String(this.minInitialRank)}> or higher rank but got ${actualTag}`
					: `Initial heading level must be ${expectedTag} but got ${actualTag}`;
			this.report(event.target, msg, location);
		} else {
			const prevRoot = this.getPrevRoot();
			const prevRootExpected = prevRoot.current + 1;

			if (level > prevRootExpected) {
				if (expected === prevRootExpected) {
					const msg = `Initial heading level for sectioning root must be ${expectedTag} but got ${actualTag}`;
					this.report(event.target, msg, location);
				} else {
					const msg = `Initial heading level for sectioning root must be between ${expectedTag} and <h${String(prevRootExpected)}> but got ${actualTag}`;
					this.report(event.target, msg, location);
				}
			}
		}
	}

	/**
	 * Check if the current element is a sectioning root and push a new root entry
	 * on the stack if it is.
	 */
	private onTagReady(event: TagReadyEvent): void {
		const { target } = event;
		if (this.isSectioningRoot(target)) {
			this.stack.push({
				node: target.unique,
				current: 0,
				h1Count: 0,
			});
		}
	}

	/**
	 * Check if the current element being closed is the element which opened the
	 * current sectioning root, in which case the entry is popped from the stack.
	 */
	private onTagClose(event: TagEndEvent): void {
		const { previous: target } = event;
		const root = this.getCurrentRoot();
		if (target.unique !== root.node) {
			return;
		}
		this.stack.pop();
	}

	private getPrevRoot(): SectioningRoot {
		return this.stack[this.stack.length - 2];
	}

	private getCurrentRoot(): SectioningRoot {
		return this.stack[this.stack.length - 1];
	}

	private isSectioningRoot(node: HtmlElement): boolean {
		const context: SelectorContext = {
			scope: node,
		};
		return this.sectionRoots.some((it) => it.match(node, context));
	}
}
