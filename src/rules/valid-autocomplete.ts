import { type Location } from "../context";
import { type HtmlElement, DOMTokenList, DynamicValue } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export const enum MessageID {
	InvalidAttribute,
	InvalidValue,
	InvalidOrder,
	InvalidToken,
	InvalidCombination,
	MissingField,
}

interface RuleContextInvalidAttribute {
	msg: MessageID.InvalidAttribute;
	what: string;
}

interface RuleContextInvalidValue {
	msg: MessageID.InvalidValue;
	type: string;
	value: string;
	what: string;
}

interface RuleContextInvalidOrder {
	msg: MessageID.InvalidOrder;
	first: string;
	second: string;
}

interface RuleContextInvalidToken {
	msg: MessageID.InvalidToken;
	token: string;
}

interface RuleContextInvalidCombine {
	msg: MessageID.InvalidCombination;
	first: string;
	second: string;
}

interface RuleContextMissingField {
	msg: MessageID.MissingField;
}

export type RuleContext =
	| RuleContextInvalidAttribute
	| RuleContextInvalidValue
	| RuleContextInvalidOrder
	| RuleContextInvalidToken
	| RuleContextInvalidCombine
	| RuleContextMissingField;

type ControlGroup =
	| "text"
	| "username"
	| "password"
	| "multiline"
	| "month"
	| "numeric"
	| "date"
	| "url"
	| "tel";

type TokenType = "section" | "hint" | "contact" | "field1" | "field2" | "webauthn";

const expectedOrder: TokenType[] = ["section", "hint", "contact", "field1", "field2", "webauthn"];

/* Field names which does not allow the optional contact token */
const fieldNames1 = [
	"name",
	"honorific-prefix",
	"given-name",
	"additional-name",
	"family-name",
	"honorific-suffix",
	"nickname",
	"username",
	"new-password",
	"current-password",
	"one-time-code",
	"organization-title",
	"organization",
	"street-address",
	"address-line1",
	"address-line2",
	"address-line3",
	"address-level4",
	"address-level3",
	"address-level2",
	"address-level1",
	"country",
	"country-name",
	"postal-code",
	"cc-name",
	"cc-given-name",
	"cc-additional-name",
	"cc-family-name",
	"cc-number",
	"cc-exp",
	"cc-exp-month",
	"cc-exp-year",
	"cc-csc",
	"cc-type",
	"transaction-currency",
	"transaction-amount",
	"language",
	"bday",
	"bday-day",
	"bday-month",
	"bday-year",
	"sex",
	"url",
	"photo",
];

/* Field names which allows for the optional contact token */
const fieldNames2 = [
	"tel",
	"tel-country-code",
	"tel-national",
	"tel-area-code",
	"tel-local",
	"tel-local-prefix",
	"tel-local-suffix",
	"tel-extension",
	"email",
	"impp",
];

/* Mapping between field names and which control group it requires */
const fieldNameGroup: Record<string, ControlGroup> = {
	name: "text",
	"honorific-prefix": "text",
	"given-name": "text",
	"additional-name": "text",
	"family-name": "text",
	"honorific-suffix": "text",
	nickname: "text",
	username: "username",
	"new-password": "password", // eslint-disable-line sonarjs/no-hardcoded-passwords -- false positive, it is not used as a password
	"current-password": "password", // eslint-disable-line sonarjs/no-hardcoded-passwords -- false positive, it is not used as a password
	"one-time-code": "password",
	"organization-title": "text",
	organization: "text",
	"street-address": "multiline",
	"address-line1": "text",
	"address-line2": "text",
	"address-line3": "text",
	"address-level4": "text",
	"address-level3": "text",
	"address-level2": "text",
	"address-level1": "text",
	country: "text",
	"country-name": "text",
	"postal-code": "text",
	"cc-name": "text",
	"cc-given-name": "text",
	"cc-additional-name": "text",
	"cc-family-name": "text",
	"cc-number": "text",
	"cc-exp": "month",
	"cc-exp-month": "numeric",
	"cc-exp-year": "numeric",
	"cc-csc": "text",
	"cc-type": "text",
	"transaction-currency": "text",
	"transaction-amount": "numeric",
	language: "text",
	bday: "date",
	"bday-day": "numeric",
	"bday-month": "numeric",
	"bday-year": "numeric",
	sex: "text",
	url: "url",
	photo: "url",
	tel: "tel",
	"tel-country-code": "text",
	"tel-national": "text",
	"tel-area-code": "text",
	"tel-local": "text",
	"tel-local-prefix": "text",
	"tel-local-suffix": "text",
	"tel-extension": "text",
	email: "username",
	impp: "url",
};

const disallowedInputTypes = ["checkbox", "radio", "file", "submit", "image", "reset", "button"];

function matchSection(token: string): boolean {
	return token.startsWith("section-");
}

function matchHint(token: string): boolean {
	return token === "shipping" || token === "billing";
}

function matchFieldNames1(token: string): boolean {
	return fieldNames1.includes(token);
}

function matchContact(token: string): boolean {
	const haystack = ["home", "work", "mobile", "fax", "pager"];
	return haystack.includes(token);
}

function matchFieldNames2(token: string): boolean {
	return fieldNames2.includes(token);
}

function matchWebauthn(token: string): boolean {
	return token === "webauthn";
}

function matchToken(token: string): TokenType | null {
	if (matchSection(token)) {
		return "section";
	}
	if (matchHint(token)) {
		return "hint";
	}
	if (matchFieldNames1(token)) {
		return "field1";
	}
	if (matchFieldNames2(token)) {
		return "field2";
	}
	if (matchContact(token)) {
		return "contact";
	}
	if (matchWebauthn(token)) {
		return "webauthn";
	}
	return null;
}

function getControlGroups(type: string): ControlGroup[] {
	const allGroups: ControlGroup[] = [
		"text",
		"multiline",
		"password",
		"url",
		"username",
		"tel",
		"numeric",
		"month",
		"date",
	];
	const mapping: Record<string, ControlGroup[] | undefined> = {
		hidden: allGroups,
		text: allGroups.filter((it) => it !== "multiline"),
		search: allGroups.filter((it) => it !== "multiline"),
		password: ["password"],
		url: ["url"],
		email: ["username"],
		tel: ["tel"],
		number: ["numeric"],
		month: ["month"],
		date: ["date"],
	};

	return mapping[type] ?? [];
}

function isDisallowedType(node: HtmlElement, type: string): boolean {
	if (!node.is("input")) {
		return false;
	}
	return disallowedInputTypes.includes(type);
}

function getTerminalMessage(context: RuleContext): string {
	switch (context.msg) {
		case MessageID.InvalidAttribute:
			return "autocomplete attribute cannot be used on {{ what }}";
		case MessageID.InvalidValue:
			return '"{{ value }}" cannot be used on {{ what }}';
		case MessageID.InvalidOrder:
			return '"{{ second }}" must appear before "{{ first }}"';
		case MessageID.InvalidToken:
			return '"{{ token }}" is not a valid autocomplete token or field name';
		case MessageID.InvalidCombination:
			return '"{{ second }}" cannot be combined with "{{ first }}"';
		case MessageID.MissingField:
			return "autocomplete attribute is missing field name";
	}
}

function getMarkdownMessage(context: RuleContext): string {
	switch (context.msg) {
		case MessageID.InvalidAttribute:
			return [
				`\`autocomplete\` attribute cannot be used on \`${context.what}\``,
				"",
				"The following input types cannot use the `autocomplete` attribute:",
				"",
				...disallowedInputTypes.map((it) => `- \`${it}\``),
			].join("\n");

		case MessageID.InvalidValue: {
			const message = `\`"${context.value}"\` cannot be used on \`${context.what}\``;
			if (context.type === "form") {
				return [
					message,
					"",
					'The `<form>` element can only use the values `"on"` and `"off"`.',
				].join("\n");
			}
			if (context.type === "hidden") {
				return [
					message,
					"",
					'`<input type="hidden">` cannot use the values `"on"` and `"off"`.',
				].join("\n");
			}
			const controlGroups = getControlGroups(context.type);
			const currentGroup = fieldNameGroup[context.value];
			return [
				message,
				"",
				`\`${context.what}\` allows autocomplete fields from the following group${controlGroups.length > 1 ? "s" : ""}:`,
				"",
				...controlGroups.map((it) => `- ${it}`),
				"",
				`The field \`"${context.value}"\` belongs to the group /${currentGroup}/ which cannot be used with this input type.`,
			].join("\n");
		}

		case MessageID.InvalidOrder:
			return [
				`\`"${context.second}"\` must appear before \`"${context.first}"\``,
				"",
				"The autocomplete tokens must appear in the following order:",
				"",
				"- Optional section name (`section-` prefix).",
				"- Optional `shipping` or `billing` token.",
				"- Optional `home`, `work`, `mobile`, `fax` or `pager` token (for fields supporting it).",
				"- Field name",
				"- Optional `webauthn` token.",
			].join("\n");

		case MessageID.InvalidToken:
			return `\`"${context.token}"\` is not a valid autocomplete token or field name`;

		case MessageID.InvalidCombination:
			return `\`"${context.second}"\` cannot be combined with \`"${context.first}"\``;

		case MessageID.MissingField:
			return "Autocomplete attribute is missing field name";
	}
}

export default class ValidAutocomplete extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: getMarkdownMessage(context),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const elements = document.querySelectorAll("[autocomplete]");
			for (const element of elements) {
				/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- selector guarantees the attribute is present */
				const autocomplete = element.getAttribute("autocomplete")!;
				if (autocomplete.value === null || autocomplete.value instanceof DynamicValue) {
					continue;
				}
				/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- location must be present as the value is */
				const location = autocomplete.valueLocation!;
				const value = autocomplete.value.toLowerCase();
				const tokens = new DOMTokenList(value, location);
				if (tokens.length === 0) {
					continue;
				}
				this.validate(element, value, tokens, autocomplete.keyLocation, location);
			}
		});
	}

	private validate(
		node: HtmlElement,
		value: string,
		tokens: DOMTokenList,
		keyLocation: Location,
		valueLocation: Location,
	): void {
		switch (node.tagName) {
			case "form":
				this.validateFormAutocomplete(node, value, valueLocation);
				break;
			case "input":
			case "textarea":
			case "select":
				this.validateControlAutocomplete(node, tokens, keyLocation);
				break;
		}
	}

	private validateControlAutocomplete(
		node: HtmlElement,
		tokens: DOMTokenList,
		keyLocation: Location,
	): void {
		const type = node.getAttributeValue("type") ?? "text";
		const mantle = type !== "hidden" ? "expectation" : "anchor";

		if (isDisallowedType(node, type)) {
			const context: RuleContext = {
				msg: MessageID.InvalidAttribute,
				what: `<input type="${type}">`,
			};
			this.report({
				node,
				message: getTerminalMessage(context),
				location: keyLocation,
				context,
			});
			return;
		}

		if (tokens.includes("on") || tokens.includes("off")) {
			this.validateOnOff(node, mantle, tokens);
			return;
		}

		this.validateTokens(node, tokens, keyLocation);
	}

	private validateFormAutocomplete(node: HtmlElement, value: string, location: Location): void {
		const trimmed = value.trim();
		if (["on", "off"].includes(trimmed)) {
			return;
		}
		const context: RuleContext = {
			msg: MessageID.InvalidValue,
			type: "form",
			value: trimmed,
			what: "<form>",
		};
		this.report({
			node,
			message: getTerminalMessage(context),
			location,
			context,
		});
	}

	private validateOnOff(
		node: HtmlElement,
		mantle: "expectation" | "anchor",
		tokens: DOMTokenList,
	): void {
		const index = tokens.findIndex((it) => it === "on" || it === "off");
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- it must be present of it wouldn't be found */
		const value = tokens.item(index)!;
		const location = tokens.location(index);
		if (tokens.length > 1) {
			const context: RuleContext = {
				msg: MessageID.InvalidCombination,
				/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- it must be present of it wouldn't be found */
				first: tokens.item(index > 0 ? 0 : 1)!,
				second: value,
			};
			this.report({
				node,
				message: getTerminalMessage(context),
				location,
				context,
			});
		}
		switch (mantle) {
			case "expectation":
				return;
			case "anchor": {
				const context: RuleContext = {
					msg: MessageID.InvalidValue,
					type: "hidden",
					value,
					what: `<input type="hidden">`,
				};
				this.report({
					node,
					message: getTerminalMessage(context),
					location: tokens.location(0),
					context,
				});
			}
		}
	}

	private validateTokens(node: HtmlElement, tokens: DOMTokenList, keyLocation: Location): void {
		const order: TokenType[] = [];

		for (const { item, location } of tokens.iterator()) {
			const tokenType = matchToken(item);
			if (tokenType) {
				order.push(tokenType);
			} else {
				const context: RuleContext = {
					msg: MessageID.InvalidToken,
					token: item,
				};
				this.report({
					node,
					message: getTerminalMessage(context),
					location,
					context,
				});
				return;
			}
		}

		const fieldTokens = order.map((it) => it === "field1" || it === "field2");

		this.validateFieldPresence(node, tokens, fieldTokens, keyLocation);
		this.validateContact(node, tokens, order);
		this.validateOrder(node, tokens, order);
		this.validateControlGroup(node, tokens, fieldTokens);
	}

	/**
	 * Ensure that exactly one field name is present from the two field lists.
	 */
	private validateFieldPresence(
		node: HtmlElement,
		tokens: DOMTokenList,
		fieldTokens: boolean[],
		keyLocation: Location,
	): void {
		const numFields = fieldTokens.filter(Boolean).length;
		if (numFields === 0) {
			const context: RuleContext = {
				msg: MessageID.MissingField,
			};
			this.report({
				node,
				message: getTerminalMessage(context),
				location: keyLocation,
				context,
			});
		} else if (numFields > 1) {
			const a = fieldTokens.indexOf(true);
			const b = fieldTokens.lastIndexOf(true);
			const context: RuleContext = {
				msg: MessageID.InvalidCombination,
				/* eslint-disable @typescript-eslint/no-non-null-assertion -- it must be present of it wouldn't be found */
				first: tokens.item(a)!,
				second: tokens.item(b)!,
				/* eslint-enable @typescript-eslint/no-non-null-assertion */
			};
			this.report({
				node,
				message: getTerminalMessage(context),
				location: tokens.location(b),
				context,
			});
		}
	}

	/**
	 * Ensure contact token is only used with field names from the second list.
	 */
	private validateContact(node: HtmlElement, tokens: DOMTokenList, order: TokenType[]): void {
		if (order.includes("contact") && order.includes("field1")) {
			const a = order.indexOf("field1");
			const b = order.indexOf("contact");
			const context: RuleContext = {
				msg: MessageID.InvalidCombination,
				/* eslint-disable @typescript-eslint/no-non-null-assertion -- it must be present of it wouldn't be found */
				first: tokens.item(a)!,
				second: tokens.item(b)!,
				/* eslint-enable @typescript-eslint/no-non-null-assertion */
			};
			this.report({
				node,
				message: getTerminalMessage(context),
				location: tokens.location(b),
				context,
			});
		}
	}

	private validateOrder(node: HtmlElement, tokens: DOMTokenList, order: TokenType[]): void {
		const indicies = order.map((it) => expectedOrder.indexOf(it));
		for (let i = 0; i < indicies.length - 1; i++) {
			if (indicies[0] > indicies[i + 1]) {
				const context: RuleContext = {
					msg: MessageID.InvalidOrder,
					/* eslint-disable @typescript-eslint/no-non-null-assertion -- it must be present of it wouldn't be found */
					first: tokens.item(i)!,
					second: tokens.item(i + 1)!,
					/* eslint-enable @typescript-eslint/no-non-null-assertion */
				};
				this.report({
					node,
					message: getTerminalMessage(context),
					location: tokens.location(i + 1),
					context,
				});
			}
		}
	}

	private validateControlGroup(
		node: HtmlElement,
		tokens: DOMTokenList,
		fieldTokens: boolean[],
	): void {
		const numFields = fieldTokens.filter(Boolean).length;
		if (numFields === 0) {
			return;
		}

		/* only <input> has restrictions on what field names can be used */
		if (!node.is("input")) {
			return;
		}

		/* if type attribute is dynamic we assume anything goes */
		const attr = node.getAttribute("type");
		const type = attr?.value ?? "text";
		if (type instanceof DynamicValue) {
			return;
		}

		const controlGroups = getControlGroups(type);
		const fieldIndex = fieldTokens.indexOf(true);
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- it must be present of it wouldn't be found */
		const fieldToken = tokens.item(fieldIndex)!;
		const fieldGroup = fieldNameGroup[fieldToken];
		if (!controlGroups.includes(fieldGroup)) {
			const context: RuleContext = {
				msg: MessageID.InvalidValue,
				type,
				value: fieldToken,
				what: `<input type="${type}">`,
			};
			this.report({
				node,
				message: getTerminalMessage(context),
				location: tokens.location(fieldIndex),
				context,
			});
		}
	}
}
