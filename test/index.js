const find = require('lodash.find')
const heads = require('heads')
const expect = require('chai').expect
const apis = require('..')
const they = it

describe('electron-apis', function () {
  it('exports an array of api objects', function () {
    expect(apis).to.be.an('array')
    expect(apis).to.not.be.empty
    expect(apis[0]).to.be.an('object')
  })

  it('adds basic properties to each object', function () {
    expect(apis.every(api => api.name.length > 0)).to.be.true
    expect(apis.every(api => api.slug.length > 0)).to.be.true
    expect(apis.every(api => api.type.length > 0)).to.be.true

    var win = find(apis, {
      name: 'BrowserWindow'
    })
    expect(win.name).to.eq('BrowserWindow')
    expect(win.slug).to.eq('browser-window')
    expect(win.type).to.eq('Class')
  })

  describe('instance methods', function () {
    var win = find(apis, {
      name: 'BrowserWindow'
    })

    they('have basic properties', function () {
      var method = find(win.instanceMethods, {name: 'setContentSize'})
      expect(method.name).to.eq('setContentSize')
      expect(method.signature).to.eq('(width, height[, animate])')
      expect(method.description).to.include('Resizes the window')
    })

    they('sometimes have a platform array', function () {
      var method = find(win.instanceMethods, {name: 'setAspectRatio'})
      expect(method.platforms[0]).to.eq('macOS')
    })
  })

  describe('URLs', function () {
    this.timeout(30 * 1000)

    it('all website URLs return a 200 status code', function (done) {
      var urls = apis.map(api => api.websiteUrl)
      heads(urls).then(function (codes) {
        expect(codes.every(code => code === 200)).to.be.true
        done()
      })
    })

    it('all repo URLs return a 200 status code', function (done) {
      var urls = apis.map(api => api.repoUrl)
      heads(urls).then(function (codes) {
        expect(codes.every(code => code === 200)).to.be.true
        done()
      })
    })
  })
})

//   t.comment('Events')
//   var app = find(apis, {name: 'app'})
//   t.ok(app.events.length > 10, '`app` API has a bunch of events')
//
//   var event = find(app.events, {name: 'quit'})
//   t.equal(event.description, 'Emitted when the application is quitting.', 'events have a `description`')
//   t.equal(event.returns[0].name, 'event', 'events have a return object with a `name` key')
//   t.equal(event.returns[0].type, 'Event', 'events have a return object with a `type` key')
//
//   // events: platforms
//   event = find(app.events, {name: 'open-file'})
//   t.equal(event.platforms[0], 'macOS', 'events can have a `platforms` array')
//
//   // events: properties
//   // var Tray = find(apis, {name: 'Tray'})
//   // var properties = find(Tray.events, {name: 'right-click'}).returns[0].properties
//   // t.equal(properties[0].name, 'altKey', 'return objects have properties with a `name`')
//   // t.equal(properties[0].type, 'Boolean', 'return objects have properties with a `type`')
