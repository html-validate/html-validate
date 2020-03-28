import { Formatter } from "./formatter";

const stylish = require("eslint/lib/cli-engine/formatters/stylish");

const formatter: Formatter = stylish;
export default formatter;
