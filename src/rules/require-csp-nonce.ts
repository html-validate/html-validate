import { type TagEndEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	tags: string[];
}

const defaults: RuleOptions = {
	tags: ["script", "style"],
};

export default class RequireCSPNonce extends Rule<void, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static override schema(): SchemaObject {
		return {
			tags: {
				type: "array",
				items: {
					enum: ["script", "style"],
					type: "string",
				},
			},
		};
	}

	public override documentation(): RuleDocumentation {
		return {
			description: [
				"Required Content-Security-Policy (CSP) nonce is missing or empty.",
				"",
				"This is set by the `nonce` attribute and must match the `Content-Security-Policy` header.",
				"For instance, if the header contains `script-src 'nonce-r4nd0m'` the `nonce` attribute must be set to `nonce=\"r4nd0m\">`",
				"",
				"The nonce should be unique per each request and set to a cryptography secure random token.",
				"It is used to prevent cross site scripting (XSS) by preventing malicious actors from injecting scripts onto the page.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const { tags } = this.options;
			const node = event.previous;

			/* ignore other tags */
			if (!tags.includes(node.tagName)) {
				return;
			}

			/* ignore if nonce is set to non-empty value (or dynamic) */
			const nonce = node.getAttribute("nonce")?.value;
			if (nonce && nonce !== "") {
				return;
			}

			/* ignore <script src> */
			if (node.is("script") && node.hasAttribute("src")) {
				return;
			}

			const message = `required CSP nonce is missing`;
			this.report(node, message, node.location);
		});
	}
}
