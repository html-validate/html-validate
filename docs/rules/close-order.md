---
docType: rule
name: close-order
summary: Require elements to be closed in correct order
---

# Disallows elements closed in the wrong order (`close-order`)

HTML requires elements to be closed in the correct order.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect-1" rules="close-order">
    <!-- closed in wrong order -->
    <p><strong></p></strong>
</validate>

<validate name="incorrect-2" rules="close-order">
    <!-- opened but not closed -->
    <div>
</validate>

<validate name="incorrect-3" rules="close-order">
    <!-- closed but not opened -->
    </div>
</validate>

Examples of **correct** code for this rule:

<validate name="correct-1" rules="close-order">
    <p><strong></strong></p>
</validate>

<validate name="correct-2" rules="close-order">
	<div></div>
</validate>
