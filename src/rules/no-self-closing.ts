import { HtmlElement, NodeClosed } from "../dom";
import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	ignoreForeign: boolean;
	ignoreXML: boolean;
}

const xmlns = /^(.+):.+$/;
const defaults: RuleOptions = {
	ignoreForeign: true,
	ignoreXML: true,
};

export default class NoSelfClosing extends Rule<string, RuleOptions> {
	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
	}

	public documentation(tagName: string): RuleDocumentation {
		tagName = tagName || "element";
		return {
			description: `Self-closing elements are disallowed. Use regular end tag <${tagName}></${tagName}> instead of self-closing <${tagName}/>.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const active = event.previous; // The current active element (that is, the current element on the stack)

			if (!isRelevant(active, this.options)) {
				return;
			}

			this.validateElement(active);
		});
	}

	private validateElement(node: HtmlElement): void {
		if (node.closed !== NodeClosed.VoidSelfClosed) {
			return;
		}

		this.report(node, `<${node.tagName}> must not be self-closed`, null, node.tagName);
	}
}

function isRelevant(node: HtmlElement, options: RuleOptions): boolean {
	/* tags in XML namespaces are relevant only if ignoreXml is false, in which
	 * case assume all xml elements must not be self-closed */
	if (node.tagName && node.tagName.match(xmlns)) {
		return !options.ignoreXML;
	}

	/* nodes with missing metadata is assumed relevant */
	if (!node.meta) {
		return true;
	}

	if (node.meta.void) {
		return false;
	}

	/* foreign elements are relevant only if ignoreForeign is false, in which case
	 * assume all foreign must not be self-closed */
	if (node.meta.foreign) {
		return !options.ignoreForeign;
	}

	return true;
}
