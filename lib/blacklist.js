// properties from Object.getOwnPropertyNames(electron.remote)
// that are not actually APIs

module.exports = [
  'isPromise',
  'deprecations',
  'getBuiltin',
  'require',
  'createFunctionWithReturnValue',
  'getCurrentWindow',
  'getCurrentWebContents',
  'deprecate',
  'getGuestWebContents',
  'getGlobal',
  'CallbacksRegistry',
  'NavigationController'
]
