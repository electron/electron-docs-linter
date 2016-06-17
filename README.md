# electron-apis

A JSON object describing Electron's public APIs

## Notes, Inspiration, and Prior Art

- [Electron Coding Style: Naming Things](https://github.com/electron/electron/blob/master/docs/development/coding-style.md#naming-things)
- [Electron Styleguide](https://github.com/electron/electron/blob/master/docs/styleguide.md)
- https://github.com/atom/autocomplete-atom-api
- https://kapeli.com/docsets#dashDocset
- [Publish the public API as JSON](https://github.com/electron/electron/issues/3375)
- https://raw.githubusercontent.com/atom/autocomplete-atom-api/master/completions.json

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
