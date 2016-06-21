// properties from Object.getOwnPropertyNames(electron.remote)
// that are not actually APIs

module.exports = function blacklist (property) {
  var nope = [
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

  return nope.indexOf(property) === -1
}
