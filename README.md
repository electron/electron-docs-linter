# electron-docs-linter [![Build Status](https://travis-ci.org/zeke/electron-docs-linter.svg?branch=master)](https://travis-ci.org/zeke/electron-docs-linter)

Parse and validate Electron's markdown API documentation.

## Installation

```sh
npm install electron-docs-linter --save
```

## CLI Usage

If linting errors are found, they are printed to STDERR and the process
exits un-gracefully.

```sh
electron-docs-linter docs/api
```

If you've piped the output, the JSON schema is written to that pipe. Note
that a `version` must be specified when piping.

```sh
electron-docs-linter docs/api --version=1.2.3 > api.json
```

If no pipe is present, you just see a nice message.

```sh
electron-docs-linter docs/api

Docs are good to go! 👍
```


## Programmatic Usage

The module exports a function that parses markdown docs in a given directory,
then returns a JSON representation of the docs.

```js
const lint = require('electron-docs-linter')
const docPath = './vendor/electron/docs/api'
const targetVersion = '1.2.3' // the soon-to-be-released version of electron

lint(docPath, targetVersion).then(function (apis) {
  // `apis` is an array of API objects. To find one:
  var win = apis.find(api => api.name === 'BrowserWindow')

  // The array also has a string key for each API name, so
  // you can access APIs like this too:
  win = apis.BrowserWindow

  win.events.length
  // => 25

  win.events[0]
  // {
  //   "name": "page-title-updated",
  //   "description": "Emitted when the document...",
  //   "returns": [
  //     {
  //       "name": "event",
  //       "type": "Event"
  //     }
  //   ]
  // }

  win.instanceMethods[20]
  // {
  //   name: 'setSize',
  //   signature: '(width, height[, animate])'
  // }
})
```

## How It Works

The linter starts with [a list of all the API names](/lib/seeds.json) as seed data.

Each API's structure is inferred by parsing its raw markdown documentation from
the [electron repo](https://github.com/electron/electron/tree/master/docs/api).
The [electron-docs](https://github.com/zeke/electron-docs) module abstracts away
the challenges of fetching file contents in bulk.

Electron's API documentation adheres to
[Electron Coding Style](https://github.com/electron/electron/blob/master/docs/development/coding-style.md#naming-things)
and the
[Electron Styleguide](https://github.com/electron/electron/blob/master/docs/styleguide.md),
so its content can be programmatically parsed. To make the content easy to parse,
the raw markdown is converted to HTML using
[marky-markdown-lite](https://ghub.io/marky-markdown-lite),
which returns a [cheerio](https://ghub.io/cheerio) DOM object that can be queried
and traversed using familiar CSS selectors.

The result is an array of API objects. The following
metadata is included for each API, where appropriate:

- name
- description
- type (Class or Object)
- process (main, renderer, or both)
- methods
- instance methods
- events
- website URL
- GitHub repository URL


## Related Things and Prior Art

- https://github.com/atom/autocomplete-atom-api
- https://kapeli.com/docsets#dashDocset
- [issue: Publish the public API as JSON](https://github.com/electron/electron/issues/3375)
- https://raw.githubusercontent.com/atom/autocomplete-atom-api/master/completions.json
- [devdocs.io](http://devdocs.io/)
- [Node.js - About this Documentation](https://nodejs.org/dist/latest-v6.x/docs/api/documentation.html)

## Dependencies

- [decamelize](https://github.com/sindresorhus/decamelize): Convert a camelized string into a lowercased one with a custom separator: unicornRainbow → unicorn_rainbow
- [electron-docs](https://github.com/zeke/electron-docs): Fetch Electron documentation as raw markdown strings
- [lodash.pick](https://github.com/lodash/lodash): The lodash method `_.pick` exported as a module.
- [marky-markdown-lite](https://github.com/zeke/marky-markdown-lite): A version of marky-markdown that does less
- [omit-empty](https://github.com/jonschlinkert/omit-empty): Recursively omit empty properties from an object. Omits empty objects, arrays, strings or zero.
- [pify](https://github.com/sindresorhus/pify): Promisify a callback-style function
- [revalidator](https://github.com/flatiron/revalidator): A cross-browser / node.js validator powered by JSON Schema
- [to-markdown](https://github.com/domchristie/to-markdown): HTML-to-Markdown converter

## Dev Dependencies

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [heads](https://github.com/zeke/heads): Make parallel HEAD requests for an array of URLs and get back their HTTP status codes.
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [standard](https://github.com/feross/standard): JavaScript Standard Style

## License

MIT
