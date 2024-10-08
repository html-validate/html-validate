/**
 * @dgProcessor
 * @description
 * Render the set of documents using the provided `templateEngine`, to `doc.renderedContent`
 * using the `extraData`, `helpers` and the templates found by `templateFinder`.
 *
 * @param {Logger} log                       A service for logging error and information messages
 * @param {TemplateFinder} templateFinder    A service that matches templates to docs.  A default
 *                                           templateFinder is provided in this base package.
 * @param {TemplateEngine} templateEngine    An instance of a templateEngine that will render the
 *                                           docs/templates. A templateEngine is an object that has
 *                                           a `getRenderer()` method, which itself returns a
 *                                           `render(template, data)` function. The base package
 *                                           doesn't provide a default templateEngine.
 *                                           There is a Nunjucks based engine in the nunjucks module.
 *
 * @property {Map} extraData      Extra data that will be passed to the rendering engine. Your
 *                                services and processors can add data to this object to be made
 *                                available in templates when they are rendered.
 * @property {Map} helpers        Extra helper functions that will be passed to the rendering engine.
 *                                Your services and processors can add helper functions to this
 *                                object to be made available in templates when they are rendered.
 */
function renderDocsProcessor(log, templateFinder, templateEngine, createDocMessage) {
	return {
		helpers: {},
		extraData: {},

		$runAfter: ["rendering-docs"],
		$runBefore: ["docs-rendered"],
		$validate: {
			helpers: {},
			extraData: {},
		},
		$process: function process(docs) {
			const render = templateEngine.getRenderer();
			const findTemplate = templateFinder.getFinder();

			docs.forEach((doc) => {
				log.debug("Rendering doc:", doc.id || doc.name || doc.path);
				try {
					const data = { doc, docs, ...this.extraData, ...this.helpers };
					const templateFile = findTemplate(data.doc);
					doc.renderedContent = render(templateFile, data);
				} catch (ex) {
					const { content, moduleDoc, components, serviceDoc, providerDoc, ...restOfDoc } = doc;
					log.debug(restOfDoc);
					throw new Error(createDocMessage("Failed to render", doc, ex));
				}
			});
		},
	};
}

module.exports = renderDocsProcessor;
