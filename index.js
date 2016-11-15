const path = require('path')
const API = require('./lib/api')
const fetchDocs = require('electron-docs')
const promisify = require('pify')
const semver = require('semver')
const exists = require('path-exists').sync
const keyedArray = require('keyed-array')

function lint (docsPath, targetVersion, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Expected a callback function as third argument')
  }

  if (!semver.valid(targetVersion)) {
    throw new TypeError(`\`targetVersion\` must be a valid version number. Got: ${targetVersion}`)
  }

  if (!exists(docsPath)) {
    throw new TypeError(`\`path\` must be an existing path on the filesystem. Got: ${docsPath}`)
  }

  // traverse into docs directory if given the electron repo path
  if (path.basename(docsPath) === 'electron') {
    docsPath = path.join(docsPath, 'docs')
  }

  return fetchDocs(docsPath)
    .then(function (docs) {
      const seeds = deriveSeeds(docs)
      var apis = seeds.map(seed => {
        seed.version = targetVersion
        return new API(seed, docs)
      })

      // Attach named keys to collection arrays for easier access
      // apis.app.events.login
      // apis.app.methods.quit
      // apis.BrowserWindow.instanceMethods.isFocused
      apis = keyedArray(apis)

      return callback(null, apis)
    })
    .catch(function (err) {
      console.error(err)
      return callback(err)
    })
}

function deriveSeeds (docs) {
  const seeds = []

  docs
    // Ignore files that aren't real APIs or data structures
    .filter(doc => doc.markdown_content.match(/^Process: \[/m) || doc.filename.match('structures'))
    .forEach(doc => {
      // H1 headings define modules and structures
      const moduleHeading = /^# (.*)/
      const moduleHeadingMatch = doc.markdown_content.match(moduleHeading)
      if (moduleHeadingMatch) {
        seeds.push({
          name: moduleHeadingMatch[1].replace(/ Object/, ''),
          structure: !!doc.filename.match('structures')
        })
      }

      // H2 headings define classes
      const classHeading = /^## Class: (.*)/m
      const classHeadingMatch = doc.markdown_content.match(classHeading)
      if (classHeadingMatch && !(moduleHeadingMatch && moduleHeadingMatch[1] === classHeadingMatch[1])) {
        // Only add seed if it's not a duplicate,
        // e.g. `web-contents` has `# WebContents` and `## Class: WebContents`
        seeds.push({
          name: classHeadingMatch[1],
          structure: false
        })
      }
    })

  return seeds
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
}

module.exports = promisify(lint)
