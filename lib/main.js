const path = require('path')
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const debug = /--debug/.test(process.argv[2])
let win

app.on('ready', function () {
  win = new BrowserWindow({show: false})
  win.loadURL('file://' + path.join(__dirname, 'renderer.html'))
  win.show()
  if (debug) {
    win.webContents.openDevTools()
    // win.maximize()
  }
})

ipc.on('apis', function (event, apis) {
  if (!debug) win.close()
  process.stdout.write(JSON.stringify(apis, null, 2))
})
