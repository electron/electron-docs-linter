const electron = require('electron')
const ipc = electron.ipcRenderer
const blacklist = require('./blacklist')
const props = {
  mainProcess: Object.getOwnPropertyNames(electron.remote).filter(blacklist),
  rendererProcess: Object.getOwnPropertyNames(electron).filter(blacklist)
}

ipc.send('props', props)
