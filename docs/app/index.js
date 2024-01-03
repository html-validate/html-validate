window.jQuery = require("jquery");
require("bootstrap-sass");

require("./config-tabs");
const { accordion } = require("./accordion");

try {
	for (const el of document.querySelectorAll("details.accordion, [data-accordion]")) {
		accordion(el);
	}
} catch (err) {
	/* eslint-disable-next-line no-console -- expected to log */
	console.error(err);
}

/* signal that sidenav is now loaded */
const sidenav = document.querySelector("#sidenav");
if (sidenav) {
	sidenav.classList.add("in");
}
