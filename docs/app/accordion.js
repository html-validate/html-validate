const DURATION = 400; /* ms */

const ClassNames = {
	EXPANDING: "accordion--expanding",
	COLLAPSING: "accordion--collapsing",
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion)");
let useAnimation = !prefersReducedMotion.matches;

prefersReducedMotion.addEventListener("change", (event) => {
	useAnimation = !event.matches;
});

/**
 * @param {HTMLElement} element
 * @returns {{ summary: HTMLElement, content: HTMLElement, setOpen(state: boolean): void, isOpen(): boolean }}
 */
function getElements(element) {
	if (element instanceof HTMLDetailsElement) {
		const summary = element.querySelector("summary");
		const content = summary.nextElementSibling;
		return {
			summary,
			content,
			setOpen(state) {
				element.open = state;
			},
			isOpen() {
				return element.open;
			},
		};
	} else if (element.dataset.accordion) {
		/** @type {HTMLInputElement} */
		const control = element.querySelector("[data-accordion-control]");
		/** @type {HTMLElement} */
		const summary = element.querySelector("[data-accordion-summary]");
		const content = document.getElementById(element.dataset.accordion);
		summary.setAttribute("aria-expanded", control.checked ? "true" : "false");
		summary.setAttribute("aria-controls", content.id);
		return {
			summary,
			content,
			setOpen(state) {
				summary.setAttribute("aria-expanded", state ? "true" : "false");
				control.checked = state;
			},
			isOpen() {
				return control.checked;
			},
		};
	} else {
		throw new Error(
			"Accordion can only be created on <details> element or an element with explicit [data-accordion] attribute",
		);
	}
}

/**
 * @param {HTMLElement} element
 * @returns {void}
 */
export function accordion(element) {
	const { summary, content, ...state } = getElements(element);

	/** @type {Animation | null} */
	let animation = null;
	let isClosing = false;
	let isExpanding = false;

	summary.addEventListener("click", (event) => {
		if (useAnimation) {
			event.preventDefault();
			element.style.overflow = "hidden";
			if (isClosing || !state.isOpen()) {
				open();
			} else if (isExpanding || state.isOpen()) {
				shrink();
			}
		}
	});

	return;

	function shrink() {
		isClosing = true;

		const startHeight = `${element.offsetHeight}px`;
		const endHeight = `${summary.offsetHeight}px`;

		element.classList.add(ClassNames.COLLAPSING);

		if (animation) {
			animation.cancel();
		}

		animation = element.animate(
			{
				height: [startHeight, endHeight],
			},
			{
				duration: DURATION,
				easing: "ease-out",
			},
		);

		animation.onfinish = () => {
			onAnimationFinish(false);
		};

		animation.oncancel = () => {
			element.classList.remove(ClassNames.COLLAPSING);
			isClosing = false;
		};
	}

	function open() {
		element.style.height = `${element.offsetHeight}px`;
		state.setOpen(true);
		window.requestAnimationFrame(() => expand());
	}

	function expand() {
		isExpanding = true;

		const startHeight = `${element.offsetHeight}px`;
		const endHeight = `${summary.offsetHeight + content.offsetHeight}px`;

		element.classList.add(ClassNames.EXPANDING);

		if (animation) {
			animation.cancel();
		}

		animation = element.animate(
			{
				height: [startHeight, endHeight],
			},
			{
				duration: DURATION,
				easing: "ease-out",
			},
		);

		animation.onfinish = () => {
			onAnimationFinish(true);
		};

		animation.oncancel = () => {
			element.classList.remove(ClassNames.EXPANDING);
			isExpanding = false;
		};
	}

	/**
	 * @param {boolean} open
	 * @returns {void}
	 */
	function onAnimationFinish(open) {
		state.setOpen(open);
		animation = null;
		isClosing = false;
		isExpanding = false;
		element.classList.remove(ClassNames.EXPANDING);
		element.classList.remove(ClassNames.COLLAPSING);
		element.style.height = "";
		element.style.overflow = "";
	}
}
