#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const sum = require('lodash.sum')
const lint = require('.')
const args = require('minimist')(process.argv.slice(2))
const piping = !process.stdout.isTTY

var docsPath = args._[0]
var version = args.version

// docsPath is required
if (!docsPath) usage()

// docsPath is relative to current working directory
docsPath = path.join(process.cwd(), docsPath)

// version is required if piping output
if (piping && !version) usage()

// Use a placeholder version if not piping output
if (!version) version = '0.0.0'

const spinner = require('ora')('Parsing electron documentation').start()

lint(docsPath, version).then(function (apis) {
  spinner.stop().clear()

  if (apis.some(api => api.errors.length)) {
    fail(apis)
  }

  if (piping) {
    process.stdout.write(JSON.stringify(apis, null, 2))
  } else {
    console.log(`Docs are good to go! 👍`)
  }

  process.exit()
})

function usage () {
  console.error(`
Usage: electron-docs-linter <pathname>

To save the parsed JSON schema:

electron-docs-linter <pathname> --version=1.2.3 --outfile=electron.json
`)
  process.exit(1)
}

function fail(apis) {
  if (apis.some(api => api.errors.length)) {
    console.error('\n🙊  uh-oh! bad docs 🙈\n')
    apis.forEach(api => {
      if (api.errors.length) api.logErrors()
    })

    const errorCount = sum(apis.map(api => api.errors.length))
    console.error(`\n${errorCount} error${errorCount === 1 ? '' : 's'} found`)
    process.exit(1)
  }
}
