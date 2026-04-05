import nunjucks from "nunjucks";

/**
 * @dgService templateEngine
 * @description A nunjucks powered template rendering engine
 */
export default function templateEngine(templateFinder) {
	return {
		/**
		 * Nunjucks specific options, such as using `{$ $}` for nunjucks interpolation
		 * rather than `{{ }}`, which conflicts with AngularJS
		 */
		config: { autoescape: false },

		filters: [],
		tags: [],

		getRenderer() {
			const loader = new nunjucks.FileSystemLoader(templateFinder.templateFolders, {
				watch: false,
				noCache: false,
			});
			const engine = new nunjucks.Environment(loader, this.config);

			// Configure nunjucks with the custom filters
			for (const filter of this.filters) {
				engine.addFilter(filter.name, filter.process);
			}

			// Configure nunjucks with the custom tags
			for (const tag of this.tags) {
				engine.addExtension(tag.tags[0], tag);
			}

			return function render(template, data) {
				return engine.render(template, data);
			};
		},
	};
}
