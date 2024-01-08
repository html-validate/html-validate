const Package = require("dgeni").Package;

module.exports = new Package("navigation", []).processor(require("./processors/navtree-processor"));
