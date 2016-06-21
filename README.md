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

The build script uses Electron to open a
browser window and inspect the properties of the `electron` and `electron.remote`
objects. The result is a collection of the names of all the
[Main Process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md)
and
[Renderer Process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md)
APIs.

For each API name found, its structure is inferred by parsing its
raw markdown documentation from the [electron repo](https://github.com/electron/electron/tree/master/docs/api).
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
- github repo URL

## Dependencies

None

## Dev Dependencies

- [electron-prebuilt](https://github.com/electron-userland/electron-prebuilt): Install electron prebuilt binaries for the command-line use using npm
- [sort-object-keys](https://github.com/keithamus/sort-object-keys): Sort an object&#39;s keys, including an optional key list
- [standard](https://github.com/feross/standard): JavaScript Standard Style
- [superagent](https://github.com/visionmedia/superagent): elegant & feature rich browser / node HTTP with a fluent API
- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha's spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers
- [decamelize](https://github.com/sindresorhus/decamelize): Convert a camelized string into a lowercased one with a custom separator: unicornRainbow → unicorn_rainbow
- [lodash.find](https://github.com/lodash/lodash): The lodash method `_.find` exported as a module.


## Related

- https://github.com/atom/autocomplete-atom-api
- https://kapeli.com/docsets#dashDocset
- [issue: Publish the public API as JSON](https://github.com/electron/electron/issues/3375)
- https://raw.githubusercontent.com/atom/autocomplete-atom-api/master/completions.json

## License

MIT
