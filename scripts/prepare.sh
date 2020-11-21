#/bin/sh

echo "Configure git commit.template"
git config --local commit.template ./node_modules/@html-validate/commitlint-config/gitmessage
