const Package = require("dgeni").Package;

const pkg = new Package("dgeni-bootstrap", []);

pkg.config(function(inlineTagProcessor, getInjectables) {
	const inlineTagsDefs = getInjectables(require("./inline-tag-defs"));
	inlineTagProcessor.inlineTagDefinitions = inlineTagProcessor.inlineTagDefinitions.concat(
		inlineTagsDefs
	);
});

module.exports = pkg;
