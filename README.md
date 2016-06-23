# electron-apis [![Build Status](https://travis-ci.org/zeke/electron-apis.svg?branch=master)](https://travis-ci.org/zeke/electron-apis)

A JSON object describing [Electron's APIs](http://electron.atom.io/docs/api/).

See [apis.json](/apis.json) or explore the object in the node repl:

```js
npm i -g trymodule && trymodule electron-apis
```

## Installation

The module just exports a JSON object, so it will work with any version of
node or browserify.

```sh
npm install electron-apis --save
```

## Usage

```js
const apis = require('electron-apis')

// `apis` is an array of API objects. To find one:
const bw = apis.find(api => api.name === 'BrowserWindow')

bw.events.length
// => 25

bw.events[0]
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

bw.instanceMethods[20]
// {
//   name: 'setSize',
//   signature: '(width, height[, animate])'
// }
```

## How It Works

The build script starts with [a list of all the API names](/lib/names.json)
as well as booleans indicating if they're available on the
[Main Process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md)
or the
[Renderer Process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md)
(or both).

Each API's structure is inferred by parsing its raw markdown documentation from
the [electron repo](https://github.com/electron/electron/tree/master/docs/api).
The [electron-docs](https://github.com/zeke/electron-docs) module abstracts away
the challenges of fetching those files in bulk.

Electron's API documentation adheres to
[Electron Coding Style](https://github.com/electron/electron/blob/master/docs/development/coding-style.md#naming-things)
and the
[Electron Styleguide](https://github.com/electron/electron/blob/master/docs/styleguide.md),
so its content can be programmatically parsed. To make the content easy to parse,
the raw markdown is converted to HTML using
[marky-markdown-lite](https://ghub.io/marky-markdown-lite),
which returns a [cheerio](https://ghub.io/cheerio) DOM object that can be queried
and traversed using familiar CSS selectors.

The result is [apis.json](/apis.json), an object that includes the following
metadata for each API, where appropriate:

- name
- description
- type (Class or Object)
- process (main, renderer, or both)
- methods
- instance methods
- events
- website URL
- GitHub repository URL

## Dependencies

None

## Dev Dependencies

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [decamelize](https://github.com/sindresorhus/decamelize): Convert a camelized string into a lowercased one with a custom separator: unicornRainbow → unicorn_rainbow
- [electron-docs](https://github.com/zeke/electron-docs): Fetch Electron documentation as raw markdown strings
- [heads](https://github.com/zeke/heads): Make parallel HEAD requests for an array of URLs and get back their HTTP status codes.
- [lodash.find](https://github.com/lodash/lodash): The lodash method `_.find` exported as a module.
- [marky-markdown-lite](https://github.com/zeke/marky-markdown-lite): A version of marky-markdown that does less
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [omit-empty](https://github.com/jonschlinkert/omit-empty): Recursively omit empty properties from an object. Omits empty objects, arrays, strings or zero.
- [standard](https://github.com/feross/standard): JavaScript Standard Style


## Related

- https://github.com/atom/autocomplete-atom-api
- https://kapeli.com/docsets#dashDocset
- [issue: Publish the public API as JSON](https://github.com/electron/electron/issues/3375)
- https://raw.githubusercontent.com/atom/autocomplete-atom-api/master/completions.json

## License

MIT
