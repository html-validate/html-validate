const { Package } = require("dgeni");

const pkg = new Package("marked", [require("../packages/nunjucks"), require("../highlight")]);

/* override markdown renderer from dgeni nunjucks package to allow setting a
 * highlighter */
pkg.factory(require("./services/renderMarkdown"));

module.exports = pkg;
