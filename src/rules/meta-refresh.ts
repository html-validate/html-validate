import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class MetaRefresh extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `Meta refresh directive must use the \`0;url=...\` format. Non-zero values for time interval is disallowed as people with assistive technology might be unable to read and understand the page content before automatically reloading. For the same reason skipping the url is disallowed as it would put the browser in an infinite loop reloading the same page over and over again.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", ({ target }) => {
			/* only handle <meta> */
			if (!target.is("meta")) {
				return;
			}

			/* only handle refresh */
			const httpEquiv = target.getAttributeValue("http-equiv");
			if (httpEquiv !== "refresh") {
				return;
			}

			/* ensure content attribute is set */
			const content = target.getAttribute("content");
			if (!content?.value || content.isDynamic) {
				return;
			}

			/* ensure content attribute is valid */
			const location = content.valueLocation;
			const value = parseContent(content.value.toString());
			if (!value) {
				this.report(target, "Malformed meta refresh directive", location);
				return;
			}

			/* ensure a url is set */
			if (!value.url) {
				this.report(target, "Don't use meta refresh to reload the page", location);
			}

			/* ensure delay is exactly 0 seconds */
			if (value.delay !== 0) {
				this.report(target, "Meta refresh must use 0 second delay", location);
			}
		});
	}
}

function parseContent(text: string): { delay: number; url: string } | null {
	const match = text.match(/^(\d+)(?:\s*;\s*url=(.*))?/);
	if (match) {
		return {
			delay: parseInt(match[1], 10),
			url: match[2],
		};
	} else {
		return null;
	}
}
