declare module "cypress-html-validate/plugin" {
	import { ConfigData, Message } from "html-validate";

	export interface ElementMessage extends Message {
		element?: HTMLElement;
	}

	export interface CypressHtmlValidateOptions {
		exclude: string[];
		include: string[];
		formatter?: (messages: ElementMessage[]) => void;
	}

	export function install(
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- we dont have the actual types and this is only used for documentation examples */
		on: (action: "task", arg: Record<string, (value: any) => any>) => void,
		userConfig?: ConfigData,
		userOptions?: Partial<CypressHtmlValidateOptions>,
	): void;

	const _default: {
		install: typeof install;
	};

	export { _default as default };
}
