const path = require('path')
const heads = require('heads')
const expect = require('chai').expect
const lint = require('..')
const they = it

var apis

describe('apis', function () {
  before(function (done) {
    var docPath = path.join(__dirname, '../vendor/electron/docs/api')
    lint(docPath, '1.2.3')
      .then(function (_apis) {
        apis = _apis
        done()
      })
  })

  it('exports a linting function', function () {
    expect(lint).to.be.a('function')
  })

  it('returns an array of api objects', function () {
    expect(apis).to.be.an('array')
    expect(apis).to.not.be.empty
    expect(apis[0]).to.be.an('object')
  })

  it('adds basic properties to each object', function () {
    expect(apis.every(api => api.name.length > 0)).to.be.true
    expect(apis.every(api => api.slug.length > 0)).to.be.true
    expect(apis.every(api => api.type.length > 0)).to.be.true
    expect(apis.every(api => api.version.length > 0)).to.be.true

    var win = apis.BrowserWindow
    expect(win.name).to.eq('BrowserWindow')
    expect(win.slug).to.eq('browser-window')
    expect(win.type).to.eq('Class')
  })

  it('validates every API against a JSON schema', function () {
    apis.forEach(api => {
      if (!api.valid) {
        console.error(`\n\nError in ${api.name} API`)
        console.error(api.validationErrors)
      }
    })
    expect(apis.every(api => api.valid)).to.be.true
  })

  describe('Instance Methods', function () {
    they('have basic properties', function () {
      var method = apis.BrowserWindow.instanceMethods.setContentSize
      expect(method.name).to.eq('setContentSize')
      expect(method.signature).to.eq('(width, height[, animate])')
      expect(method.description).to.include('Resizes the window')
    })

    they('sometimes have a platform array', function () {
      expect(apis.BrowserWindow.instanceMethods.setAspectRatio.platforms[0]).to.eq('macOS')
    })
  })

  describe('Events', function () {
    it('is an array of event objects', function () {
      expect(apis.app.events.length).to.be.above(10)
      expect(apis.app.events.every(event => event.name.length > 0)).to.be.true
    })

    they('have a name, description, and type', function () {
      var event = apis.app.events.quit
      expect(event.description).to.eq('Emitted when the application is quitting.')
      expect(event.returns[0].name).to.eq('event')
      expect(event.returns[0].type).to.eq('Event')
    })

    they('sometimes have a platforms array', function () {
      var event = apis.app.events['open-file']
      expect(event.platforms[0]).to.eq('macOS')
    })

    they('sometimes have return values that are complex objects', function () {
      var event = apis.app.events['certificate-error']
      var properties = event.returns[4].properties
      expect(properties.length).to.eq(2)
      expect(properties[0].name).to.eq('data')
      expect(properties[0].type).to.eq('Buffer')
      expect(properties[0].description).to.eq('PEM encoded data')
    })
  })

  describe('JSON serialization', function () {
    it('preserves desired properties and omits the unwanted ones', function () {
      var api = JSON.parse(JSON.stringify(apis.app))
      expect(api.name).to.exist
      expect(api.description).to.exist
      expect(api.type).to.exist
      expect(api.slug).to.exist
      expect(api.websiteUrl).to.exist
      expect(api.repoUrl).to.exist

      expect(api.errors).to.not.exist
      expect(api.docs).to.not.exist
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

    it('sets a repoUrl', function () {
      var url = 'https://github.com/electron/electron/blob/v1.2.3/docs/api/tray.md'
      expect(apis.Tray.repoUrl).to.equal(url)
    })
  })
})
