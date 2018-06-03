#!/bin/sh

exec sed "s/## Upcoming release/\0\n\n## ${npm_package_version} ($(date +%Y-%m-%d))/" -i CHANGELOG.md
