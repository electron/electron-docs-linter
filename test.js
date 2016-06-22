const test = require('tape')
// const superagent = require('superagent')
const find = require('lodash.find')
const apis = require('.')

test('electron-apis', function (t) {
  t.ok(Array.isArray(apis), 'is an array')
  t.ok(apis.length >= 26, 'is not empty')

  t.comment('Classes')
  var BrowserWindow = find(apis, {name: 'BrowserWindow'})
  t.equal(BrowserWindow.name, 'BrowserWindow', 'BrowserWindow has a name')
  t.equal(BrowserWindow.slug, 'browser-window', 'BrowserWindow has a slug that matches documentation filename')
  t.equal(BrowserWindow.type, 'Class', 'BrowserWindow type is `Class`')

  t.comment('Instance Methods')
  t.ok(BrowserWindow.instanceMethods.length > 10, 'BrowserWindow has a bunch of instance methods')
  var im = find(BrowserWindow.instanceMethods, {name: 'setContentSize'})
  t.equal(im.name, 'setContentSize', 'instance methods have a `name`')
  t.equal(im.signature, '(width, height[, animate])', 'instance methods have a `signature`')

  t.comment('Events')
  var app = find(apis, {name: 'app'})
  t.ok(app.events.length > 10, '`app` API has a bunch of events')

  var event = find(app.events, {name: 'quit'})
  t.equal(event.description, 'Emitted when the application is quitting.', 'events have a `description`')
  t.equal(event.returns[0].name, 'event', 'events have a return object with a `name` key')
  t.equal(event.returns[0].type, 'Event', 'events have a return object with a `type` key')

  // events: platforms
  event = find(app.events, {name: 'open-file'})
  t.equal(event.platforms[0], 'OS X', 'events can have a `platforms` array')

  // events: properties
  var Tray = find(apis, {name: 'Tray'})
  var properties = find(Tray.events, {name: 'right-click'}).returns[0].properties
  t.equal(properties[0].name, 'altKey', 'return objects have properties with a `name`')
  t.equal(properties[0].type, 'Boolean', 'return objects have properties with a `type`')

  t.end()

  // TODO: make test async-friendly, then bring back these http checks:
  // apis.forEach(api => {
  //   t.comment(api.name)
  //   t.ok(api.websiteUrl, 'has a websiteUrl')
  //   superagent
  //     .head(api.repoUrl)
  //     .end(function (err, res) {
  //       t.equal(200, res.status, `has a repoUrl that actually exists: ${api.name}`)
  //     })
  // })
})
