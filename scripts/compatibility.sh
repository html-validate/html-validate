#!/bin/bash

set -e

cd $(dirname $0)/..

echo "Testing if node bundle is importable"
node --input-type commonjs -e 'require("./dist/cjs/index.js")'
node --input-type module -e 'import("./dist/esm/index.js")'

echo "Testing if browser bundle is importable"
node --input-type commonjs -e 'require("./dist/cjs/browser.js")'
node --input-type module -e 'import("./dist/esm/browser.js")'

echo "Testing if elements bundle is importable"
node --input-type commonjs -e 'require("./dist/cjs/elements.js")'
node --input-type module -e 'import("./dist/esm/elements.js")'

set +e

echo "Testing if html-validate can successfully validate a file"
./bin/html-validate.mjs test-files/elements/table-valid.html
if [[ $? != 0 ]]; then
	echo "Compatibility test failed, expected command to exit with zero status"
	exit 1
fi

echo "Testing if html-validate can successfully validate a invalid file"
./bin/html-validate.mjs test-files/elements/table-invalid.html > /dev/null
if [[ $? = 0 ]]; then
	echo "Compatibility test failed, expected command to exit with non-zero status"
	exit 1
fi

echo "Testing if html-validate will save report to file"
mkdir -p temp
./bin/html-validate.mjs -f json=temp/report.json test-files/elements/table-valid.html
if [[ $? != 0 ]]; then
	echo "Compatibility test failed, expected command to exit with zero status"
	exit 1
fi
if [[ "$(cat temp/report.json)" != "[]" ]]; then
	echo "Compatibility test failed, expected command to write report to file"
	exit 1
fi

echo "Testing if html-validate will save report to file in subdirectory"
./bin/html-validate.mjs -f json=temp/compatibility/report.json test-files/elements/table-valid.html
if [[ $? != 0 ]]; then
	echo "Compatibility test failed, expected command to exit with zero status"
	exit 1
fi
if [[ "$(cat temp/compatibility/report.json)" != "[]" ]]; then
	echo "Compatibility test failed, expected command to write report to file"
	exit 1
fi

echo "Testing if html-validate can successfully validate stdin"
cat test-files/elements/table-valid.html | ./bin/html-validate.mjs --stdin
if [[ $? != 0 ]]; then
	echo "Compatibility test failed, expected command to exit with zero status"
	exit 1
fi

echo "Testing ESM CLI"
./bin/html-validate.mjs html-validate tests/integration/esm-cli
if [[ $? != 0 ]]; then
	echo "Compatibility test failed, expected command to exit with zero status"
	exit 1
fi

echo "Testing CJS CLI"
./bin/html-validate.mjs html-validate tests/integration/cjs-cli
if [[ $? != 0 ]]; then
	echo "Compatibility test failed, expected command to exit with zero status"
	exit 1
fi
