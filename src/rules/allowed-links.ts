import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

export const enum Style {
	EXTERNAL = "external",
	RELATIVE_BASE = "relative-base",
	RELATIVE_PATH = "relative-path",
	ABSOLUTE = "absolute",
	ANCHOR = "anchor",
}

/**
 * @internal
 */
export interface AllowList<T> {
	include: T[] | null;
	exclude: T[] | null;
}

interface RuleOptions {
	allowExternal: boolean | AllowList<string>;
	allowRelative: boolean | AllowList<string>;
	allowAbsolute: boolean | AllowList<string>;
	allowBase: boolean;
}

const defaults: RuleOptions = {
	allowExternal: true,
	allowRelative: true,
	allowAbsolute: true,
	allowBase: true,
};

const mapping: Record<string, string> = {
	a: "href",
	img: "src",
	link: "href",
	script: "src",
};

const description: Record<Style, string | null> = {
	[Style.EXTERNAL]: "External links are not allowed by current configuration.",
	[Style.RELATIVE_BASE]: "Links relative to <base> are not allowed by current configuration.",
	[Style.RELATIVE_PATH]: "Relative links are not allowed by current configuration.",
	[Style.ABSOLUTE]: "Absolute links are not allowed by current configuration.",
	[Style.ANCHOR]: null,
};

function parseAllow(value: boolean | AllowList<string>): boolean | AllowList<RegExp> {
	if (typeof value === "boolean") {
		return value;
	}
	return {
		/* eslint-disable security/detect-non-literal-regexp -- expected to be regexp  */
		include: value.include ? value.include.map((it) => new RegExp(it)) : null,
		exclude: value.exclude ? value.exclude.map((it) => new RegExp(it)) : null,
		/* eslint-enable security/detect-non-literal-regexp */
	};
}

/**
 * @internal
 */
export function matchList(value: string, list: AllowList<RegExp>): boolean {
	if (list.include && !list.include.some((it) => it.test(value))) {
		return false;
	}
	if (list.exclude?.some((it) => it.test(value))) {
		return false;
	}
	return true;
}

export default class AllowedLinks extends Rule<Style, RuleOptions> {
	protected allowExternal: boolean | AllowList<RegExp>;
	protected allowRelative: boolean | AllowList<RegExp>;
	protected allowAbsolute: boolean | AllowList<RegExp>;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.allowExternal = parseAllow(this.options.allowExternal);
		this.allowRelative = parseAllow(this.options.allowRelative);
		this.allowAbsolute = parseAllow(this.options.allowAbsolute);
	}

	public static schema(): SchemaObject {
		const booleanOrObject = {
			anyOf: [
				{ type: "boolean" },
				{
					type: "object",
					properties: {
						include: {
							type: "array",
							items: { type: "string" },
						},
						exclude: {
							type: "array",
							items: { type: "string" },
						},
					},
				},
			],
		};
		return {
			allowExternal: { ...booleanOrObject },
			allowRelative: { ...booleanOrObject },
			allowAbsolute: { ...booleanOrObject },
			allowBase: { type: "boolean" },
		};
	}

	public documentation(context: Style): RuleDocumentation {
		const message =
			description[context] ?? "This link type is not allowed by current configuration";
		return {
			description: message,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (!event.value || !this.isRelevant(event)) {
				return;
			}

			const link = event.value.toString();
			const style = this.getStyle(link);

			switch (style) {
				case Style.ANCHOR:
					/* anchor links are always allowed by this rule */
					break;

				case Style.ABSOLUTE:
					this.handleAbsolute(link, event, style);
					break;

				case Style.EXTERNAL:
					this.handleExternal(link, event, style);
					break;

				case Style.RELATIVE_BASE:
					this.handleRelativeBase(link, event, style);
					break;

				case Style.RELATIVE_PATH:
					this.handleRelativePath(link, event, style);
					break;
			}
		});
	}

	protected isRelevant(event: AttributeEvent): boolean {
		const { target, key, value } = event;

		/* don't check links with dynamic values */
		if (value instanceof DynamicValue) {
			return false;
		}

		const attr = mapping[target.tagName];
		return Boolean(attr && attr === key);
	}

	protected getStyle(value: string): Style {
		/* http://example.net or //example.net */
		if (value.match(/^([a-z]+:)?\/\//g)) {
			return Style.EXTERNAL;
		}
		switch (value[0]) {
			/* /foo/bar */
			case "/":
				return Style.ABSOLUTE;
			/* ../foo/bar */
			case ".":
				return Style.RELATIVE_PATH;
			/* #foo */
			case "#":
				return Style.ANCHOR;
			/* foo/bar */
			default:
				return Style.RELATIVE_BASE;
		}
	}

	protected handleAbsolute(target: string, event: AttributeEvent, style: Style): void {
		const { allowAbsolute } = this;
		if (allowAbsolute === true) {
			return;
		} else if (allowAbsolute === false) {
			this.report(
				event.target,
				"Link destination must not be absolute url",
				event.valueLocation,
				style,
			);
		} else if (!matchList(target, allowAbsolute)) {
			this.report(
				event.target,
				"Absolute link to this destination is not allowed by current configuration",
				event.valueLocation,
				style,
			);
		}
	}

	protected handleExternal(target: string, event: AttributeEvent, style: Style): void {
		const { allowExternal } = this;
		if (allowExternal === true) {
			return;
		} else if (allowExternal === false) {
			this.report(
				event.target,
				"Link destination must not be external url",
				event.valueLocation,
				style,
			);
		} else if (!matchList(target, allowExternal)) {
			this.report(
				event.target,
				"External link to this destination is not allowed by current configuration",
				event.valueLocation,
				style,
			);
		}
	}

	protected handleRelativePath(target: string, event: AttributeEvent, style: Style): boolean {
		const { allowRelative } = this;
		if (allowRelative === true) {
			return false;
		} else if (allowRelative === false) {
			this.report(
				event.target,
				"Link destination must not be relative url",
				event.valueLocation,
				style,
			);
			return true;
		} else if (!matchList(target, allowRelative)) {
			this.report(
				event.target,
				"Relative link to this destination is not allowed by current configuration",
				event.valueLocation,
				style,
			);
			return true;
		}
		return false;
	}

	private handleRelativeBase(target: string, event: AttributeEvent, style: Style): void {
		const { allowBase } = this.options;
		if (this.handleRelativePath(target, event, style)) {
			return;
		} else if (!allowBase) {
			this.report(
				event.target,
				"Relative links must be relative to current folder",
				event.valueLocation,
				style,
			);
		}
	}
}
