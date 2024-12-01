const pkg = require("../package.json");

module.exports = {
	userguide: {
		title: "User guide",
		items: [
			{
				title: "Getting started",
				children: [
					{ title: "Getting started", target: "usage" },
					{ title: "Using CLI", target: "usage/cli" },
				],
			},
			{
				title: "Configuration",
				children: [
					{ title: "Elements", target: "usage/elements" },
					{ title: "Transformers", target: "usage/transformers" },
				],
			},
			{
				title: "Integrations",
				children: [
					{ title: "VS Code", target: "usage/vscode" },
					{ title: "AngularJS", target: "frameworks/angularjs" },
					{ title: "Cypress", target: "usage/cypress" },
					{ title: "Grunt", target: "usage/grunt" },
					{ title: "Jest", target: "frameworks/jest" },
					{ title: "Protractor", target: "usage/protractor" },
					{ title: "Vitest", target: "frameworks/vitest" },
					{ title: "Vue.js", target: "frameworks/vue" },
				],
			},
			{ title: "Migrating from older versions", target: "migration" },
		],
	},

	metadata: {
		title: "Elements",
		items: [
			{ title: "A simple component", target: "guide/metadata/simple-component" },
			{ title: "Restricting element content", target: "guide/metadata/restrict-content" },
			{ title: "Restricting element attributes", target: "guide/metadata/restrict-attributes" },
			{ title: "Inheritance", target: "guide/metadata/inheritance" },
			{ title: "Best practice", target: "guide/metadata/best-practice" },
			{ title: "Writing tests", target: "guide/metadata/writing-tests" },
		],
	},

	rules: {
		title: "Rules",
		items: [
			{ title: "Rules reference", target: "rules" },
			{ title: "Configuration presets", target: "rules/presets" },
		],
	},

	devguide: {
		title: "Developers guide",
		items: [
			{
				title: "API",
				children: [
					{ title: "Using API", target: "dev/using-api" },
					{ title: "Getting starterd with API", target: "guide/api/getting-started" },
					{ title: "Running in a browser", target: "dev/running-in-browser" },
					{ title: "Writing rules", target: "dev/writing-rules" },
					{ title: "Writing plugins", target: "dev/writing-plugins" },
					{ title: "Writing transformers", target: "dev/transformers" },
					{ title: "List of events", target: "dev/events" },
				],
			},
			{
				title: "Releases",
				children: [{ title: "Release and support plan", target: "dev/releases" }],
			},
			{
				title: "Contribute",
				children: [
					{ title: "Getting the source code", href: pkg.repository.url.replace(/^git\+/, "") },
					{ title: "File issue", href: pkg.bugs.url },
				],
			},
		],
	},

	about: {
		title: "About",
		items: [
			{ title: "About HTML-validate", target: "about" },
			{ title: "Sponsoring", target: "about/sponsoring" },
		],
	},
};
