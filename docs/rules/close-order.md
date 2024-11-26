---
docType: rule
name: close-order
category: syntax
summary: Require elements to be closed in correct order
standards:
  - html5
---

# Require elements to be closed in correct order

HTML requires elements to be closed in the correct order.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect-stray-endtag" rules="close-order">
	<main>
			<label>Lorem ipsum</label>
		</div> <!-- div closed but never opened -->
	</main>
</validate>

<validate name="incorrect-missing-endtag" rules="close-order">
	<main>
		<h1> <!-- h1 opened but not closed -->
			Lorem ipsum <small>dolor sit amet</small>
	</main>
</validate>

<validate name="incorrect-wrong-endtag" rules="close-order">
	<main>
		<h1>
			Lorem ipsum <small>dolor sit amet</small>
		</h1>
	</div> <!-- opened as main but closed as div -->
</validate>

<validate name="incorrect-out-of-order" rules="close-order">
	<div>
		<!-- closed in wrong order -->
		<p>
			<strong>
		</p>
			</strong>
	</div>
</validate>

<validate name="incorrect-incorrect-implicit" rules="close-order">
	<p>
		<address></address>
	</p> <!-- p is already implicitly closed by address tag -->
</validate>

Examples of **correct** code for this rule:

<validate name="correct-1" rules="close-order">
    <p><strong></strong></p>
</validate>

<validate name="correct-2" rules="close-order">
	<div></div>
</validate>
