#!/usr/bin/env nodejs
'use strict';

let HtmlLint = require('./src/htmllint');
let htmllint = new HtmlLint();

htmllint.string('<div foobar id="spam"><p></p></div>');
