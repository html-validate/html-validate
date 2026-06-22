import jQuery from "jquery";

async function init() {
	/* eslint-disable-next-line unicorn/no-global-object-property-assignment -- intentional for now */
	window.jQuery = jQuery;

	await import("bootstrap-sass");
	await import("./config-tabs.mjs");
	const { accordion } = await import("./accordion.mjs");

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
}

await init();
