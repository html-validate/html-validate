import fs from "fs";
import deepmerge from "deepmerge";
import inquirer from "inquirer";
import { ConfigData } from "../config";

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
	const when = /* istanbul ignore next */ (answers: any): boolean => {
		return !exists || answers.write;
	};
	const questions: inquirer.QuestionCollection = [
		{
			name: "write",
			type: "confirm",
			default: false,
			when: exists,
			message:
				"A .htmlvalidate.json file already exists, do you want to overwrite it?",
		},
		{
			name: "frameworks",
			type: "checkbox",
			choices: [Frameworks.angularjs, Frameworks.vuejs, Frameworks.markdown],
			message: "Support additional frameworks?",
			when,
		},
	];

	/* prompt user for questions */
	const answers = await inquirer.prompt(questions);

	/* dont overwrite configuration unless explicitly requested */
	if (exists && !answers.write) {
		return Promise.reject();
	}

	/* write configuration to file */
	let config = initialConfig;
	config = addFrameworks(config, answers.frameworks);
	await writeConfig(filename, config);

	return {
		filename,
	};
}
