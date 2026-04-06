import hljs from "highlight.js";

function configure(options) {
	hljs.configure(options);
}

function registerAliases(alias, options) {
	hljs.registerAliases(alias, options);
}

function render(code, lang) {
	if (lang) {
		return hljs.highlight(code, { language: lang }).value;
	} else {
		return hljs.highlightAuto(code).value;
	}
}

render.configure = configure;
render.registerAliases = registerAliases;

export default function highlight() {
	return render;
}
