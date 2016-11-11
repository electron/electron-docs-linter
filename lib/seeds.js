module.exports = [
  {
    name: 'clipboard'
  },
  {
    name: 'crashReporter'
  },
  {
    name: 'nativeImage'
  },
  {
    name: 'NativeImage',
    parentDoc: 'native-image',
    instanceName: 'image'
  },
  {
    name: 'shell'
  },
  {
    name: 'app'
  },
  {
    name: 'autoUpdater'
  },
  {
    name: 'BrowserWindow',
    instanceName: 'win'
  },
  {
    name: 'contentTracing'
  },
  {
    name: 'dialog'
  },
  {
    name: 'ipcMain'
  },
  {
    name: 'globalShortcut'
  },
  {
    name: 'Menu',
    instanceName: 'menu'
  },
  {
    name: 'net'
  },
  {
    name: 'ClientRequest',
    parentDoc: 'net',
    instanceName: 'request'
  },
  {
    name: 'DownloadItem',
    process: {main: false, renderer: false},
    instanceName: 'downloadItem'
  },
  {
    name: 'IncomingMessage',
    parentDoc: 'net',
    instanceName: 'response'
  },
  {
    name: 'MenuItem',
    instanceName: 'menuItem'
  },
  {
    name: 'powerMonitor'
  },
  {
    name: 'powerSaveBlocker'
  },
  {
    name: 'protocol'
  },
  {
    name: 'screen'
  },
  {
    name: 'session'
  },
  {
    name: 'Session',
    parentDoc: 'session',
    instanceName: 'ses'
  },
  {
    name: 'Cookies',
    parentDoc: 'session',
    instanceName: 'cookies'
  },
  {
    name: 'WebRequest',
    parentDoc: 'session',
    instanceName: 'webRequest'
  },
  {
    name: 'systemPreferences'
  },
  {
    name: 'Tray',
    instanceName: 'tray'
  },
  {
    name: 'webContents'
  },
  {
    name: 'WebContents',
    parentDoc: 'web-contents',
    instanceName: 'contents'
  },
  {
    name: 'Debugger',
    parentDoc: 'web-contents',
    instanceName: 'debugger'
  },
  {
    name: 'process'
  },
  {
    name: 'desktopCapturer'
  },
  {
    name: 'ipcRenderer'
  },
  {
    name: 'remote'
  },
  {
    name: 'webFrame'
  },
  {
    name: 'BrowserWindowProxy',
    parentDoc: 'window-open',
    instanceName: 'win'
  },
  {
    name: 'BluetoothDevice',
    structure: true
  },
  {
    name: 'Certificate',
    structure: true
  },
  {
    name: 'Cookie',
    structure: true
  },
  {
    name: 'CrashReport',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'DesktopCapturerSource',
    structure: true
  },
  {
    name: 'Display',
    structure: true
  },
  {
    name: 'FileFilter',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'JumpListCategory',
    structure: true
  },
  {
    name: 'JumpListItem',
    structure: true
  },
  {
    name: 'MemoryUsageDetails',
    structure: true
  },
  {
    name: 'Rectangle',
    structure: true
  },
  {
    name: 'ShortcutDetails',
    structure: true
  },
  {
    name: 'Task',
    structure: true
  },
  {
    name: 'ThumbarButton',
    structure: true
  },
  {
    name: 'UploadData',
    structure: true
  }
]
