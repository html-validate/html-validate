import { FormatterModule } from ".";

const stylish = require("eslint/lib/formatters/stylish");
export default stylish;

declare const module: FormatterModule;
module.exports = stylish;
