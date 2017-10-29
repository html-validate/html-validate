@ngdoc content
@module usage
@name Grunt task
@description

# Grunt task

    npm install --save-dev grunt-html-validate


## Usage

```js
require('load-grunt-tasks')(grunt);

grunt.initConfig({
	htmlvalidate: {
		default: {
			src: ['file.html']
		}
	}
});
```

Run with

    grunt htmlvalidate
