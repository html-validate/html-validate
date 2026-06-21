import Dgeni from "dgeni";
import navtreeProcessor from "./processors/navtree-processor.mjs";

const { Package } = Dgeni;

/* eslint-disable-next-line unicorn/no-unreadable-new-expression -- established pattern for dgeni */
export default new Package("navigation", []).processor(navtreeProcessor);
