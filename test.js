const test = require('tape')
const superagent = require('superagent')
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
  t.ok(BrowserWindow.instance_methods.length > 10, 'BrowserWindow has a bunch of instance methods')
  var im = find(BrowserWindow.instance_methods, {name: 'setContentSize'})
  t.equal(im.name, 'setContentSize', 'instance methods have a `name`')
  t.equal(im.signature, '(width, height[, animate])', 'instance methods have a `signature`')

  t.comment('Events')
  var app = find(apis, {name: 'app'})
  t.ok(app.events.length > 10, 'app has a bunch of events')

  // console.log(app.events)
  var event = find(app.events, {name: 'quit'})
  t.equal(event.description, 'Emitted when the application is quitting.', 'events have a `description`')
  t.equal(event.returns[0].name, 'event', 'events have a return object with a `name` key')
  t.equal(event.returns[0].type, 'Event', 'events have a return object with a `type` key')
  t.equal(event.returns[1].name, 'exitCode', 'events have a return object with a `name` key')
  t.equal(event.returns[1].type, 'Integer')

  event = find(app.events, {name: 'open-file'})
  t.equal(event.platforms[0], 'OS X', 'events can have a `platforms` array')

  // Classes
  // var classes = apis.filter(api => api.type === 'Class')
  // t.ok(classes.length > 0, 'contains multiple Classes')
  // classes.forEach(klass => {
  //   t.ok(klass.instance_methods.length > 0, `${klass.name} has instance methods`)
  // })

  t.end()

  // apis.forEach(api => {
  //   t.comment(api.name)
  //   t.ok(api.website_url, 'has a website_url')
  //   superagent
  //     .head(api.github_docs_url)
  //     .end(function (err, res) {
  //       t.equal(200, res.status, `has a github_docs_url that actually exists: ${api.name}`)
  //     })
  // })

})
