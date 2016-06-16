const electron = require('electron')
const ipc = electron.ipcRenderer
const find = require('lodash.find')
const decamelize = require('decamelize')
const sortKeys = require('sort-object-keys')
const blacklist = require('./blacklist')
const mainProcessApis = Object.getOwnPropertyNames(electron.remote)
  .filter(api => blacklist.indexOf(api) === -1)
const rendererProcessApis = Object.getOwnPropertyNames(electron)
  .filter(api => blacklist.indexOf(api) === -1)

// Find Main Process APIs
let apis = mainProcessApis.map(prop => {
  return {
    name: prop,
    main_process: true
  }
})

// Find Renderer Process APIs
rendererProcessApis.forEach(prop => {
  let api = find(apis, {name: prop})
  if (api) {
    api.renderer_process = true
  } else {
    apis.push({
      name: prop,
      renderer_process: true
    })
  }
})

// Add extra properties to all APIs
apis.forEach(api => {
  api.slug = decamelize(api.name, '-')
  api.website_url = `http://electron.atom.io/docs/api/${api.slug}`
  api.github_docs_url = `https://github.com/electron/electron/blob/v${process.versions.electron}/docs/api/${api.slug}.md`
  api.type = (api.name.charAt(0) === api.name.charAt(0).toLowerCase())
    ? 'Object'
    : 'Class'

  var methods
  if (api.type === 'Object' && api.main_process) {
    methods = Object.getOwnPropertyNames(electron.remote[api.name])
  }

  if (api.type === 'Object' && api.renderer_process) {
    methods = Object.getOwnPropertyNames(electron[api.name])
  }

  if (api.type === 'Class' && api.renderer_process) {
    var foo = new electron[api.name]()
    methods = Object.getOwnPropertyNames(foo)
  }

  api.methods = methods

})

ipc.send('apis', apis)
