#!/usr/bin/env node

const fetchDocs = require('electron-docs')
const API = require('../lib/api')
const names = require('../lib/names.json')

fetchDocs().then(function (docs) {
  var apis = names.map(props => new API(props, docs))

  process.stdout.write(JSON.stringify(apis, null, 2))
})
