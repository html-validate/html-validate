@ngdoc rule
@module rules
@name prefer-tbody
@summary Prefer to wrap <tr> inside <tbody>
@description

# Prefer to wrap `<tr>` inside `<tbody>` (`prefer-tbody`)

While `<tbody>` is optional is relays semantic information about its
contents.

Where applicable it should also be combined with `<thead>` and `<tfoot>`.

## Rule details

Examples of **incorrect** code for this rule:

<validate name="incorrect" rules="prefer-tbody">
	<table>
		<tr><td>...</td></tr>
	</table>
</validate>

Examples of **correct** code for this rule:

<validate name="correct" rules="prefer-tbody">
	<table>
		<tbody>
			<tr><td>...</td></tr>
		</tbody>
	</table>
</validate>
