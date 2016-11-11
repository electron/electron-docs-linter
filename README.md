# electron-docs-linter [![Build Status](https://travis-ci.org/electron/electron-docs-linter.svg?branch=master)](https://travis-ci.org/electron/electron-docs-linter)

Parse and validate Electron's API documentation.

## Installation

```sh
npm install electron-docs-linter --save
```

## CLI Usage

To lint the docs:

```sh
electron-docs-linter path/to/electron/docs
```

If errors are found, they are printed to STDERR and the process
exits un-gracefully.

To lint the docs and save the generated [JSON schema](http://electron.atom.io/blog/2016/09/27/api-docs-json-schema) to a file:

```sh
electron-docs-linter docs/api --version=1.2.3 --outfile=api.json
```

## Programmatic Usage

The module exports a function that parses markdown docs in a given directory,
then returns a JSON representation of all the APIs.

```js
const lint = require('electron-docs-linter')
const docPath = './test/fixtures/electron/docs/api'
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

The linter starts with [a list of all the API names](/lib/seeds.js) as seed data.

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
- type (Class or Module)
- process (main, renderer, or both)
- methods
- events
- static methods (aka class methods)
- instance events
- instance methods
- instance properties
- website URL
- GitHub repository URL

## Related Things and Prior Art

- https://github.com/atom/autocomplete-atom-api
- https://kapeli.com/docsets#dashDocset
- [issue: Publish the public API as JSON](https://github.com/electron/electron/issues/3375)
- https://raw.githubusercontent.com/atom/autocomplete-atom-api/master/completions.json
- [devdocs.io](http://devdocs.io/)
- [Node.js - About this Documentation](https://nodejs.org/dist/latest-v6.x/docs/api/documentation.html)

## TypeScript Definitions

A lot of people want an up-to-date TypeScript definition file for Electron.

- https://github.com/MarshallOfSound/Electron-DefinitelyTyped (WIP)
- https://github.com/electron/electron/issues/4875
- https://www.npmjs.com/package/@types/electron
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/github-electron
- https://github.com/RyanCavanaugh/dts-dom - A DOM library for generation TypeScript declaration (.d.ts) files
- https://github.com/lbovet/typson - Converts TypeScript to JSON-schema
- https://github.com/lbovet/docson - Documentation for your JSON types

## Dependencies

- [cheerio](https://github.com/cheeriojs/cheerio): Tiny, fast, and elegant implementation of core jQuery designed specifically for the server
- [clean-deep](https://github.com/seegno/clean-deep): Remove falsy, empty or nullable values from objects
- [decamelize](https://github.com/sindresorhus/decamelize): Convert a camelized string into a lowercased one with a custom separator: unicornRainbow → unicorn_rainbow
- [dedent](https://github.com/dmnd/dedent): An ES6 string tag that strips indentation from multi-line strings
- [electron-docs](https://github.com/zeke/electron-docs): Fetch Electron documentation as raw markdown strings
- [keyed-array](https://github.com/zeke/keyed-array): Recursively add named keys to arrays of objects
- [lodash.pick](https://github.com/lodash/lodash): The lodash method `_.pick` exported as a module.
- [lodash.sum](https://github.com/lodash/lodash): The lodash method `_.sum` exported as a module.
- [marky-markdown-lite](https://github.com/zeke/marky-markdown-lite): A version of marky-markdown that does less
- [minimist](https://github.com/substack/minimist): parse argument options
- [ora](https://github.com/sindresorhus/ora): Elegant terminal spinner
- [path-exists](https://github.com/sindresorhus/path-exists): Check if a path exists
- [pify](https://github.com/sindresorhus/pify): Promisify a callback-style function
- [revalidator](https://github.com/flatiron/revalidator): A cross-browser / node.js validator powered by JSON Schema
- [semver](https://github.com/npm/node-semver): The semantic version parser used by npm.
- [to-markdown](https://github.com/domchristie/to-markdown): HTML-to-Markdown converter

## Dev Dependencies

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [rimraf](https://github.com/isaacs/rimraf): A deep deletion module for node (like `rm -rf`)
- [standard](https://github.com/feross/standard): JavaScript Standard Style

## License

MIT
