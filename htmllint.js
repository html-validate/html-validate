#!/usr/bin/env nodejs

var htmllint = require('./src/htmllint');

htmllint.string('<div foobar id="spam"><p></p></div>');
