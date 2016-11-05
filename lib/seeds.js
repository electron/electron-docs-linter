module.exports = [
  {
    name: 'clipboard',
    process: {main: true, renderer: true}
  },
  {
    name: 'crashReporter',
    process: {main: true, renderer: true}
  },
  {
    name: 'nativeImage',
    process: {main: true, renderer: true}
  },
  {
    name: 'NativeImage',
    process: {main: true, renderer: true},
    parentDoc: 'native-image',
    instanceName: 'image'
  },
  {
    name: 'shell',
    process: {main: true, renderer: true}
  },
  {
    name: 'app',
    process: {main: true, renderer: false}
  },
  {
    name: 'autoUpdater',
    process: {main: true, renderer: false}
  },
  {
    name: 'BrowserWindow',
    process: {main: true, renderer: false},
    instanceName: 'win'
  },
  {
    name: 'contentTracing',
    process: {main: true, renderer: false}
  },
  {
    name: 'dialog',
    process: {main: true, renderer: false}
  },
  {
    name: 'ipcMain',
    process: {main: true, renderer: false}
  },
  {
    name: 'globalShortcut',
    process: {main: true, renderer: false}
  },
  {
    name: 'Menu',
    process: {main: true, renderer: false},
    instanceName: 'menu'
  },
  {
    name: 'net',
    process: {main: true, renderer: false}
  },
  {
    name: 'ClientRequest',
    process: {main: true, renderer: false},
    parentDoc: 'net',
    instanceName: 'request'
  },
  {
    name: 'IncomingMessage',
    process: {main: true, renderer: false},
    parentDoc: 'net',
    instanceName: 'response'
  },
  {
    name: 'MenuItem',
    process: {main: true, renderer: false},
    instanceName: 'menuItem'
  },
  {
    name: 'powerMonitor',
    process: {main: true, renderer: false}
  },
  {
    name: 'powerSaveBlocker',
    process: {main: true, renderer: false}
  },
  {
    name: 'protocol',
    process: {main: true, renderer: false}
  },
  {
    name: 'screen',
    process: {main: true, renderer: true}
  },
  {
    name: 'session',
    process: {main: true, renderer: false}
  },
  {
    name: 'Session',
    process: {main: true, renderer: false},
    parentDoc: 'session',
    instanceName: 'ses'
  },
  {
    name: 'Cookies',
    process: {main: true, renderer: false},
    parentDoc: 'session',
    instanceName: 'cookies'
  },
  {
    name: 'WebRequest',
    process: {main: true, renderer: false},
    parentDoc: 'session',
    instanceName: 'webRequest'
  },
  {
    name: 'systemPreferences',
    process: {main: true, renderer: false}
  },
  {
    name: 'Tray',
    process: {main: true, renderer: false},
    instanceName: 'tray'
  },
  {
    name: 'webContents',
    process: {main: true, renderer: false}
  },
  {
    name: 'WebContents',
    process: {main: true, renderer: false},
    parentDoc: 'web-contents',
    instanceName: 'contents'
  },
  {
    name: 'Debugger',
    process: {main: true, renderer: false},
    parentDoc: 'web-contents',
    instanceName: 'debugger'
  },
  {
    name: 'process',
    process: {main: true, renderer: false}
  },
  {
    name: 'desktopCapturer',
    process: {main: false, renderer: true}
  },
  {
    name: 'ipcRenderer',
    process: {main: false, renderer: true}
  },
  {
    name: 'remote',
    process: {main: false, renderer: true}
  },
  {
    name: 'webFrame',
    process: {main: false, renderer: true}
  },
  {
    name: 'BrowserWindowProxy',
    process: {main: false, renderer: true},
    parentDoc: 'window-open',
    instanceName: 'win'
  },
  {
    name: 'BluetoothDevice',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'Certificate',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'Cookie',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'DesktopCapturerSource',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'Display',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'FileFilter',
    process: {main:true, renderer: true},
    structure: true
  },
  {
    name: 'JumpListCategory',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'JumpListItem',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'MemoryUsageDetails',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'Rectangle',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'ShortcutDetails',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'Task',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'ThumbarButton',
    process: {main: true, renderer: true},
    structure: true
  },
  {
    name: 'UploadData',
    process: {main: true, renderer: true},
    structure: true
  }
]
