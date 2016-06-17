const test = require('tape')
const superagent = require('superagent')
const find = require('lodash.find')
const apis = require('.')

test('apis', function (t) {

  t.ok(Array.isArray(apis), 'is an array')
  t.ok(apis.length >= 26, 'is not empty')

  var BrowserWindow = find(apis, {name: 'BrowserWindow'})
  t.equal(BrowserWindow.name, 'BrowserWindow', 'BrowserWindow has a name')
  t.equal(BrowserWindow.slug, 'browser-window', 'BrowserWindow has a slug that matches documentation filename')
  t.equal(BrowserWindow.type, 'Class', 'BrowserWindow type is `Class`')

  // Instance Methods
  var m = find(BrowserWindow.instance_methods, {name: 'setContentSize'})
  t.equal(m.name, 'setContentSize', 'instance methods have a `name`')
  t.equal(m.signature, '(width, height[, animate])', 'instance methods have a `signature`')
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
