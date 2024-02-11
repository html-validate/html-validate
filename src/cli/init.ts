import fs from "fs";
import deepmerge from "deepmerge";
import prompts from "prompts";
import { type ConfigData } from "..";

/**
 * @public
 */
export interface InitResult {
	filename: string;
}

export enum Frameworks {
	angularjs = "AngularJS",
	vuejs = "Vue.js",
	markdown = "Markdown",
}

const frameworkConfig: Record<string, ConfigData> = {
	[Frameworks.angularjs]: {
		transform: {
			"^.*\\.js$": "html-validate-angular/js",
			"^.*\\.html$": "html-validate-angular/html",
		},
	},
	[Frameworks.vuejs]: {
		plugins: ["html-validate-vue"],
		extends: ["html-validate-vue:recommended"],
		transform: {
			"^.*\\.vue$": "html-validate-vue",
		},
	},
	[Frameworks.markdown]: {
		transform: {
			"^.*\\.md$": "html-validate-markdown",
		},
	},
};

function addFrameworks(src: ConfigData, frameworks: string[]): ConfigData {
	let config = src;
	for (const framework of frameworks) {
		config = deepmerge(config, frameworkConfig[framework]);
	}
	return config;
}

function writeConfig(dst: string, config: ConfigData): Promise<void> {
	return new Promise((resolve, reject) => {
		fs.writeFile(dst, JSON.stringify(config, null, 2), (err) => {
			if (err) reject(err);
			resolve();
		});
	});
}

export async function init(cwd: string): Promise<InitResult> {
	const filename = `${cwd}/.htmlvalidate.json`;
	const exists = fs.existsSync(filename);
	const initialConfig: ConfigData = {
		elements: ["html5"],
		extends: ["html-validate:recommended"],
	};

	/* confirm overwrite */
	if (exists) {
		const result = await prompts({
			name: "overwrite",
			type: "confirm",
			message: "A .htmlvalidate.json file already exists, do you want to overwrite it?",
		});
		if (!result.overwrite) {
			/* eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- technical debt, should not result in failure at all */
			return Promise.reject();
		}
	}

	const questions: prompts.PromptObject[] = [
		{
			name: "frameworks",
			type: "multiselect",
			choices: [
				{ title: Frameworks.angularjs, value: Frameworks.angularjs },
				{ title: Frameworks.vuejs, value: Frameworks.vuejs },
				{ title: Frameworks.markdown, value: Frameworks.markdown },
			],
			message: "Support additional frameworks?",
		},
	];

	/* prompt user for questions */
	const answers = await prompts(questions);

	/* write configuration to file */
	let config = initialConfig;
	config = addFrameworks(config, answers.frameworks as string[]);
	await writeConfig(filename, config);

	return {
		filename,
	};
}
