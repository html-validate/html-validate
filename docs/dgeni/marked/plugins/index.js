const { plugin: codePlugin } = require("./code");
const { plugin: containerPlugin } = require("./container");
const { plugin: headingPlugin } = require("./heading");
const { ruleInfoPlugin } = require("./rule-info");

module.exports = {
	code: codePlugin,
	container: containerPlugin,
	heading: headingPlugin,
	ruleInfoPlugin,
};
