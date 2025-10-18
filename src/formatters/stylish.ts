import { stylish as stylishImpl } from "@html-validate/stylish";
import kleur from "kleur";
import { type Result } from "../reporter";

function linkSummary(results: Result[]): string {
	const urls = results.reduce<string[]>((result, it): string[] => {
		const urls: string[] = it.messages
			.map((error) => error.ruleUrl)
			.filter((error): error is string => Boolean(error));
		return [...result, ...urls];
	}, []);

	const unique = Array.from(new Set(urls));
	if (unique.length === 0) {
		return "";
	}

	const lines = unique.map((url) => `  ${url}\n`);
	return `\n${kleur.bold("More information")}:\n${lines.join("")}\n`;
}

export function stylish(results: Result[]): string {
	const errors = stylishImpl(
		results.map((it) => ({
			...it,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
		})),
	);
	const links = linkSummary(results);
	return `${errors}${links}`;
}
