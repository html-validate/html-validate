import { type Location } from "../context";
import { type HtmlElement } from "../dom";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	allowLongDelay: boolean;
}

const defaults: RuleOptions = {
	allowLongDelay: false,
};

export default class MetaRefresh extends Rule<void, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

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

			const { delay, url } = value;
			this.validateDelay(target, location, delay, url);
		});
	}

	private validateDelay(
		target: HtmlElement,
		location: Location | null,
		delay: number,
		url: string,
	): void {
		const { allowLongDelay } = this.options;

		/* delay over 20h is allowed only if option is enabled */
		if (allowLongDelay && delay > 72000) {
			return;
		}

		/* if refresh is instant a url must be provided or it will be an infinite refresh loop */
		if (!url && delay === 0) {
			this.report(target, "Don't use instant meta refresh to reload the page", location);
			return;
		}

		/* ensure delay is exactly 0 seconds */
		if (delay !== 0) {
			const message = allowLongDelay
				? "Meta refresh must be instant (0 second delay) or greater than 20 hours (72000 second delay)"
				: "Meta refresh must be instant (0 second delay)";
			this.report(target, message, location);
		}
	}
}

function parseContent(text: string): { delay: number; url: string } | null {
	const match = text.match(/^(\d+)(?:\s*;\s*url=(.*))?/i);
	if (match) {
		return {
			delay: parseInt(match[1], 10),
			url: match[2],
		};
	} else {
		return null;
	}
}
