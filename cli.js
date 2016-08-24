#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const dedent = require('dedent')
const sum = require('lodash.sum')
const lint = require('.')
const args = require('minimist')(process.argv.slice(2))

var docsPath = args._[0]
var version = args.version
var outfile = args.outfile

// docsPath is required
if (!docsPath) usage()

// docsPath is relative to current working directory
docsPath = path.join(process.cwd(), docsPath)

// outfile is relative to current working directory
if (outfile) outfile = path.join(process.cwd(), outfile)

// version is required if writing to a file
if (outfile && !version) usage()

// Use a placeholder version if not writing to a file
if (!version) version = '0.0.0'

const spinner = require('ora')('Parsing electron documentation').start()

lint(docsPath, version).then(function (apis) {
  spinner.stop().clear()

  if (apis.some(api => api.errors.length)) {
    fail(apis)
  }

  if (outfile) {
    fs.writeFileSync(outfile, JSON.stringify(apis, null, 2))
    console.log(dedent`
      Created ${path.relative(process.cwd(), outfile)}
    `)
  } else {
    console.log(dedent`
      Docs are good to go!\n
      To write the docs schema to a file, specify \`version\` and \`outfile\`:\n
      electron-docs-linter ${path.relative(process.cwd(), docsPath)} --version=1.2.3 --outfile=electron.json
    `)
  }

  process.exit()
})

function usage () {
  console.error(dedent`
    Usage: electron-docs-linter <pathname>\n
    To save the parsed JSON schema:\n
    electron-docs-linter <pathname> --version=1.2.3 --outfile=electron.json\n`)
  process.exit(1)
}

function fail (apis) {
  if (apis.some(api => api.errors.length)) {
    console.error('\n🙊  uh-oh! bad docs 🙈\n')
    apis.forEach(api => {
      if (api.errors.length) api.logErrors()
    })

    const errorCount = sum(apis.map(api => api.errors.length))
    console.error(`${errorCount} error${errorCount === 1 ? '' : 's'} found`)
    process.exit(1)
  }
}
