const path = require('path')
const find = require('lodash.find')
const heads = require('heads')
const expect = require('chai').expect
const lint = require('..')
const they = it

var apis

describe('apis', function () {
  before(function (done) {
    var docPath = path.join(__dirname, '../vendor/electron/docs/api')
    lint(docPath)
      .then(function (_apis) {
        apis = _apis
        done()
      })
  })

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

  describe('Instance Methods', function () {
    var win

    before(function () {
      win = find(apis, {name: 'BrowserWindow'})
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

  describe('Events', function () {
    var app

    before(function () {
      app = find(apis, {name: 'app'})
    })

    it('is an array of event objects', function () {
      expect(app.events.length).to.be.above(10)
      expect(app.events.every(event => event.name.length > 0)).to.be.true
    })

    they('have a name, description, and type', function () {
      var event = find(app.events, {name: 'quit'})
      expect(event.description).to.eq('Emitted when the application is quitting.')
      expect(event.returns[0].name).to.eq('event')
      expect(event.returns[0].type).to.eq('Event')
    })

    they('sometimes have a platforms array', function () {
      var event = find(app.events, {name: 'open-file'})
      expect(event.platforms[0]).to.eq('macOS')
    })

    they('sometimes have return values that are complex objects', function () {
      var event = find(app.events, {name: 'certificate-error'})
      var properties = event.returns[4].properties
      expect(properties.length).to.eq(2)
      expect(properties[0].name).to.eq('data')
      expect(properties[0].type).to.eq('Buffer')
      expect(properties[0].description).to.eq('PEM encoded data')
    })
  })

  describe('Convenience URLs', function () {
    this.timeout(10 * 1000)

    it('all website URLs return a 200 status code', function (done) {
      var urls = apis.map(api => api.websiteUrl)
      heads(urls).then(function (codes) {
        expect(codes.every(code => code === 200)).to.be.true
        done()
      })
    })

  // it('all repository URLs return a 200 status code', function (done) {
  //   var urls = apis.map(api => api.repoUrl)
  //   heads(urls).then(function (codes) {
  //     expect(codes.every(code => code === 200)).to.be.true
  //     done()
  //   })
  // })
  })
})
