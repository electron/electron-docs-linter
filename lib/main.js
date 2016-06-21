const path = require('path')
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const find = require('lodash.find')
const fetchDocs = require('electron-docs')
const API = require('./api')
const debug = /--debug/.test(process.argv[2])
var win

app.on('ready', function () {
  win = new BrowserWindow({show: false})
  win.loadURL('file://' + path.join(__dirname, 'renderer.html'))
  win.show()
  if (debug) win.webContents.openDevTools()
})

ipc.on('props', function (event, props) {
  var apis = []

  // Collect Main Process APIs
  props.mainProcess.forEach(prop => {
    apis.push(new API({name: prop, mainProcess: true}))
  })

  // Collect Renderer Process APIs
  props.rendererProcess.forEach(prop => {
    let api = find(apis, {name: prop})
    if (api) {
      api.rendererProcess = true
    } else {
      apis.push(new API({name: prop, rendererProcess: true}))
    }
  })

  // Infer API properties from markdown documentation
  fetchDocs(process.versions.electron).then(function (docs) {
    apis.forEach(api => api.document(docs))

    if (!debug) win.close()
    process.stdout.write(JSON.stringify(apis, null, 2))
  })
})
