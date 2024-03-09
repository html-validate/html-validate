const { plugin: codePlugin } = require("./code");
const { plugin: headingPlugin } = require("./heading");
const { ruleInfoPlugin } = require("./rule-info");

module.exports = { code: codePlugin, heading: headingPlugin, ruleInfoPlugin };
