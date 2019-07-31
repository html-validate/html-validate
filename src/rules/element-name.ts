import { sliceLocation } from "../context";
import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	pattern: "^[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$",
	whitelist: [] as string[],
	blacklist: [] as string[],
};

class ElementName extends Rule {
	private pattern: RegExp;

	constructor(options: object) {
		super(Object.assign({}, defaults, options));

		// eslint-disable-next-line security/detect-non-literal-regexp
		this.pattern = new RegExp(this.options.pattern);
	}

	public documentation(): RuleDocumentation {
		return {
			description:
				"HTML defines what content is considered a valid (custom) element name.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		const xmlns = /^(.+):.+$/;
		this.on("tag:open", (event: TagOpenEvent) => {
			const target = event.target;
			const tagName = target.tagName;
			const location = sliceLocation(event.location, 1);

			/* check if element is blacklisted */
			if (this.options.blacklist.indexOf(tagName) >= 0) {
				this.report(target, `<${tagName}> element is blacklisted`, location);
			}

			/* assume that an element with meta has valid name as it is a builtin
			 * element */
			if (target.meta) {
				return;
			}

			/* ignore elements in xml namespaces, they should be validated against a
			 * DTD instead */
			if (tagName.match(xmlns)) {
				return;
			}

			/* check if element is whitelisted */
			if (this.options.whitelist.indexOf(tagName) >= 0) {
				return;
			}

			if (!tagName.match(this.pattern)) {
				this.report(
					target,
					`<${tagName}> is not a valid element name`,
					location
				);
			}
		});
	}
}

module.exports = ElementName;
