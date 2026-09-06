#!/bin/bash

set -euo pipefail

REPO_ROOT="$(realpath "$(dirname "$0")/..")"

source "$(dirname "$0")/testbed-utils.sh"

usage() {
	echo "Usage: $(basename "$0") <jest-major> [--shell]" >&2
	echo "" >&2
	echo "  <jest-major>  major jest version to test against, e.g. 29 or 30" >&2
	echo "  --shell       start an interactive shell in the testbed instead of running tests" >&2
}

if [[ $# -lt 1 ]]; then
	usage
	exit 1
fi

JEST_MAJOR="$1"
shift

INTERACTIVE=0
while [[ $# -gt 0 ]]; do
	case "$1" in
		--shell)
			INTERACTIVE=1
			shift
			;;
		-h | --help)
			usage
			exit 0
			;;
		*)
			echo "Unknown argument: $1" >&2
			usage
			exit 1
			;;
	esac
done

if ! [[ "${JEST_MAJOR}" =~ ^[0-9]+$ ]]; then
	echo "Invalid jest major version: ${JEST_MAJOR}" >&2
	usage
	exit 1
fi

echo "Resolving package versions for jest v${JEST_MAJOR}"

JEST_VERSION="$(get_min_version "${JEST_MAJOR}" jest)"
TYPES_VERSION="$(get_min_version "${JEST_MAJOR}" @types/jest)"
TS_JEST_VERSION="$(get_min_version "${JEST_MAJOR}" ts-jest)"
TS_VERSION="$(get_min_version "${JEST_MAJOR}" typescript)"

echo "  jest:        ${JEST_VERSION}"
echo "  ts-jest:     ${TS_JEST_VERSION}"
echo "  typescript:  ${TS_VERSION}"
echo "  @types/jest: ${TYPES_VERSION}"

TESTBED=$(testbed_create \
	"${REPO_ROOT}/testbeds/jest/." \
	"${REPO_ROOT}/tests/jest/."
)
echo "Testbed: ${TESTBED}" >&2

cleanup() {
	echo trap
	rm -rf "${TESTBED}"
}

trap cleanup EXIT INT TERM

echo "  Installing html-validate"
testbed_install_tarball "${TESTBED}" "${REPO_ROOT}"

echo "  Installing toolchain for jest v${JEST_MAJOR}"
testbed_install_pkg "${TESTBED}" \
	"@jest/globals@${JEST_VERSION}" \
	"@types/jest@${TYPES_VERSION}" \
	"jest-environment-jsdom@${JEST_VERSION}" \
	"jest@${JEST_VERSION}" \
	"ts-jest@${TS_JEST_VERSION}" \
	"typescript@${TS_VERSION}"

testbed_activate "${TESTBED}" npm test
