@ngdoc content
@name Protractor plugin
@description

# Protractor plugin

To validate browser source from protractor:

    npm install --save-dev protractor-html-validate

In `protractor.conf.js`:

```js
{
    plugins: [
        /* load plugin */
        {package: 'protractor-html-validate'}
    ],

    onPrepare: () => {
        /* load jasmine helper */
        require('protractor-html-validate/jasmine');
    }
}
```

See [protractor-html-validate][npm] for details.

[npm]: https://www.npmjs.com/package/protractor-html-validate
