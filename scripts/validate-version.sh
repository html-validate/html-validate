#!/bin/bash

exec > /dev/stderr

branch=$(git rev-parse --abbrev-ref HEAD)

if [[ "$branch" = "HEAD" ]]; then
	echo "Must be on a branch when bumping version"
	exit 1
fi

# prereleases is ok anywhere
if [[ "${npm_package_version}" =~ -[0-9]+$ ]]; then
	exit 0
fi

# prevent branches other than master and release/*
if [[ ! "$branch" =~ master|release/.* ]]; then
	echo "Can only bump non-prerelease version on master or release/* branches"
	exit 1
fi
