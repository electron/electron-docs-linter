# electron-apis

A JSON object describing electron's internal APIs

## Notes and Prior Art

- https://github.com/atom/autocomplete-atom-api
- https://kapeli.com/docsets#dashDocset
- https://github.com/electron/electron/issues/3375
- https://raw.githubusercontent.com/atom/autocomplete-atom-api/master/completions.json
- https://github.com/electron/electron/issues/5010#issuecomment-206749071

## Electron Naming Conventions

From https://github.com/electron/electron/issues/5010#issuecomment-206749071

> The basic idea is, the name of API should match how you use them. So use CamelCase when it is a class, or mixedCase when you want to call its methods.

* When the module itself is a class, like `BrowserWindow` => use CamelCase
* When the module is a set of APIs, like `clipboard` => use mixedCase
* When the API is a property of object, and it is complex enough to be in a separate chapter, like `win.webContents` => use mixedCase
* For other non-module APIs, use natural titles, like `<webview> Tag` or `Process Object`.

> This follows the style of Node's APIs.

## Installation

```sh
npm install electron-apis --save
```

## Tests

```sh
npm install
npm test
```

## Dependencies

None

## Dev Dependencies

- [electron-prebuilt](https://github.com/electron-userland/electron-prebuilt): Install electron prebuilt binaries for the command-line use using npm
- [slug](https://github.com/dodo/node-slug): slugifies even utf-8 chars!
- [sort-object-keys](https://github.com/keithamus/sort-object-keys): Sort an object&#39;s keys, including an optional key list
- [standard](https://github.com/feross/standard): JavaScript Standard Style
- [superagent](https://github.com/visionmedia/superagent): elegant &amp; feature rich browser / node HTTP with a fluent API
- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha&#39;s spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers
- [decamelize](https://github.com/sindresorhus/decamelize): Convert a camelized string into a lowercased one with a custom separator: unicornRainbow → unicorn_rainbow
- [lodash.find](https://github.com/lodash/lodash): The lodash method `_.find` exported as a module.


## License

MIT
