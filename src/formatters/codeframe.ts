import { FormatterModule } from ".";

declare const module: FormatterModule;
module.exports = require("eslint/lib/formatters/codeframe");
