# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to electron-docs-linter
on GitHub. These are just guidelines, not rules, so use your best judgment
and feel free to propose changes to this document in a pull request.

## Development

Install dependencies and run the tests:

```sh
npm i && npm t
```

To fetch the latest docs from electron/electron's master branch:

```sh
npm run fetch-docs
```

Sometimes it's useful to test against another branch or commit:

```sh
npm run fetch-docs -- some-other-branch
# or
npm run fetch-docs -- 75b010ce6314c56ec083adfa1a9835e3cfa348ea
```
