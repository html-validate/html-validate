_npm_install() {
	npm install --silent --no-audit --no-fund --ignore-scripts "${@}" >&2
}

get_min_version() {
	local major="$1"
	local pkg="$2"
	node "$(dirname $0)/get-min-version.mjs" "${major}" "${pkg}"
}

# Creates a temporary directory outside the working directory and registers
# automatic cleanup for it on exit. Returns the path to the temporary directory.
testbed_create() {
	local dst
	dst=$(mktemp -d "${TMPDIR:-/tmp}/html-validate-testbed.XXXXXX") || return 1
	for src in "$@"; do
		cp -R "${src}" "${dst}/"
	done
	(
		cd "${dst}"
		_npm_install
		for spec in *.spec.ts; do
			sed -e 's#\.\./\.\./src/jest#html-validate/jest#g' \
				-e 's#\.\./\.\./src#html-validate#g' \
				-i "${spec}"
		done
	) >&2
	echo $dst
}

# Installs packages into the testbed
testbed_install_pkg() {
	local dst="$1"
	shift
	(
		cd "${dst}"
		_npm_install --save-dev "${@}"
	)
}

# Installs the local html-validat ebuild into the testbed
testbed_install_tarball() {
	local dst="$1"
	local src="$2"
	local tarball_name
	local tarball_path

	tarball_name=$(npm pack --silent --pack-destination "${dst}" "${src}" 2>/dev/null) || return 1
	tarball_path="${dst}/${tarball_name}"
	(
		cd "${dst}"
		_npm_install --save-dev "${tarball_path}"
	)
}

# Runs command in testbed or if INTERACTIVE is set drops into a shell
testbed_activate() {
	local dst="$1"
	shift
	(
		cd "${dst}"
		if [[ "${INTERACTIVE}" -eq "1" ]]; then
			echo "Starting shell in testbed. Type 'exit' to leave and clean up."
			(exec "${SHELL:-bash}") # subshell to allow exit trap to run
		else
			echo "Running \"${@}\" in testbed. Use '--shell' to drop into a shell."
			"$@"
		fi
	)
}
