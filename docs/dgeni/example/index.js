const Package = require("dgeni").Package;

module.exports = new Package("example")
	.factory(require("./services/example"))
	.processor(require("./processors/generate-example-code"));
