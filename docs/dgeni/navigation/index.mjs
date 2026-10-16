import Dgeni from "dgeni";
import navtreeProcessor from "./processors/navtree-processor.mjs";

const { Package } = Dgeni;

/* eslint-disable-next-line unicorn/no-top-level-side-effects -- false positive */
export default new Package("navigation", []).processor(navtreeProcessor);
