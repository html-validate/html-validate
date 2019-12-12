const Package = require("dgeni").Package;

module.exports = new Package("schema", [])
	.processor(require("./processors/copy-schema-processor"))
	.factory(require("./services/copy-schema"));
