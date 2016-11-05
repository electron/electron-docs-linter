const path = require('path')
const expect = require('chai').expect
const lint = require('..')
const they = it

var apis

describe('APIs', function () {
  this.timeout(10 * 1000)

  before(function (done) {
    var docPath = path.join(__dirname, '../vendor/electron/docs/api')
    lint(docPath, '1.2.3')
      .then(function (_apis) {
        apis = _apis
        done()
      })
      .catch(function (err) {
        console.error(err)
      })
  })

  it('exports a linting function', function () {
    expect(lint).to.be.a('function')
  })

  it('returns an array of api objects', function () {
    expect(apis).to.be.an('array')
    expect(apis.length).to.be.at.least(30)
    expect(apis.every(api => typeof api === 'object'))
    expect(apis.every(api => api.constructor.name === 'API'))
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

  describe('process', function () {
    it('is an object with `main` and `renderer` keys', function () {
      expect(apis.Tray.process.main).to.equal(true)
      expect(apis.Tray.process.renderer).to.equal(false)
    })
  })

  describe('Classes', function () {
    they('have a type property of `Class`', function () {
      expect(apis.Session.type).to.eq('Class')
      expect(apis.Cookies.type).to.eq('Class')
      expect(apis.WebRequest.type).to.eq('Class')
    })

    they('sometimes have a constructor (whereas others are instantiated by factory methods)', function () {
      var method = apis.BrowserWindow.constructorMethod
      expect(method.signature).to.equal('([options])')
      expect(method.parameters).to.be.an('array')
      expect(method.parameters.length).to.equal(1)
      expect(method.parameters[0].properties.length).to.be.above(20)
    })

    they('have a description property', function () {
      expect(apis.every(api => api.type === 'Structure' || api.description.length > 0)).to.equal(true)
      expect(apis.Session.description).to.equal('Get and set properties of a session.')
    })

    they('have an instanceName property', function () {
      var classes = apis.filter(api => api.type === 'Class')
      expect(classes.length).to.be.above(10)
      expect(classes.every(api => api.instanceName.length > 0)).to.equal(true)
      expect(apis.BrowserWindow.instanceName).to.equal('win')
    })
  })

  describe('Methods', function () {
    they('have basic properties', function () {
      var method = apis.app.methods.exit
      expect(method.name).to.eq('exit')
      expect(method.signature).to.eq('([exitCode])')
      expect(method.parameters[0].name).to.equal('exitCode')
      expect(method.parameters[0].type).to.equal('Integer')
    })

    they('sometimes have a platform array', function () {
      expect(apis.app.methods.hide.platforms[0]).to.eq('macOS')
    })

    they('always have documented parameters', function () {
      var assertions = 0
      apis.forEach(api => {
        var methods = api.methods || []
        methods.forEach(method => {
          if (method.signatureParameters.length) {
            if (method.parameters.length > 1 && method.parameters[1].name === '...args') return
            expect(JSON.stringify(method.signatureParameters)).to.equal(
              JSON.stringify(method.parameters.map(arg => arg.name)),
              `${api.name}.${method.name}${method.signature} is missing parameter docs`
            )
            assertions++
          }
        })
      })
      expect(assertions).to.be.above(80)
    })
  })

  describe('Parameters', function () {
    it('preserves code backticks in descriptions and converts HTML to text', function () {
      var callback = apis.WebContents.instanceMethods.savePage.parameters.callback
      expect(callback.description).to.equal('`(error) => {}`.')
    })

    it('detects when parameters are required')//, function () {
      // expect(apis.BrowserWindow.instanceMethods.setSize.parameters.animate.required).to.eq(false)
    // })

    they('can have descriptions that span multiple lines', function () {
      var method = apis.BrowserWindow.instanceMethods.setAspectRatio.parameters.extraSize
      expect(method.description).to.equal('(optional) - The extra size not to be included while maintaining the aspect ratio.')
    })

    they('do not have a `required` key if they are for an event', function () {
      var keys = Object.keys(apis.app.events.activate.returns.hasVisibleWindows)
      expect(keys).to.include('name')
      expect(keys).to.include('type')
      expect(keys).to.not.include('required')
    })

    they('do not contain HTML encoded characters', function () {
      var stringified = JSON.stringify(apis)
      expect(stringified).to.not.include('&apos')
      expect(stringified).to.not.include('&amp')

      expect(apis.Certificate
        .properties.issuerName.description
      ).to.equal("Issuer's Common Name")

      expect(apis.shell.methods.writeShortcutLink.parameters.operation
        .possibleValues[2].description
      ).to.include("doesn't")
    })

    they('are careful not to inherit nested properties', function () {
      var props = apis.WebContents.instanceMethods.enableDeviceEmulation.parameters.parameters.properties

      // top-level
      expect(props.screenPosition).to.exist
      expect(props.screenSize).to.exist

      // nested
      expect(props.desktop).to.be.undefined
      expect(props.mobile).to.be.undefined
      expect(props.width).to.be.undefined
      expect(props.height).to.be.undefined
    })

    they('can have possible values', function () {
      var values = apis.WebContents.instanceMethods.savePage.parameters.saveType.possibleValues
      expect(values.length).to.equal(3)
      expect(values[0].value).to.equal('HTMLOnly')
      expect(values[0].description).to.equal('Save only the HTML of the page.')
      expect(values[2].value).to.equal('MHTML')
      expect(values[2].description).to.equal('Save complete-html page as MHTML.')

      values = apis.powerSaveBlocker.methods.start.parameters.type.possibleValues
      expect(values[0].value).to.equal('prevent-app-suspension')
      expect(values[1].value).to.equal('prevent-display-sleep')
    })

    they('can have possible values with descriptions can span multiple lines', function () {
      var possibleValue = apis.powerSaveBlocker.methods.start.parameters.type.possibleValues[1]
      expect(possibleValue.value).to.equal('prevent-display-sleep')
      expect(possibleValue.description).to.include('Keeps system and screen active')
    })

    they('can have possible values that are declared inline', function () {
      var possibleValues = apis.WebContents.instanceMethods.openDevTools.parameters[0].properties[0].possibleValues
      expect(possibleValues.length).to.equal(4)
      expect(possibleValues.map(v => v.value)).to.deep.equal(['right', 'bottom', 'undocked', 'detach'])
    })

    they('do not always have an ENUM of possible values', function () {
      var param = apis.clipboard.methods.writeHTML.parameters.markup
      expect(param.name).to.equal('markup')
      expect(param.type).to.equal('String')
      expect(param.possibleValues).to.be.undefined
    })
  })

  describe('Static Methods', function () {
    they('have basic properties', function () {
      var method = apis.BrowserWindow.staticMethods.getAllWindows
      expect(method.name).to.eq('getAllWindows')
      expect(method.signature).to.eq('()')
      expect(method.description).to.eq('')
      expect(method.returns.type).to.eq('BrowserWindow[]')
      expect(method.returns.description).to.eq('An array of all opened browser windows.')
    })

    they('always have documented parameters', function () {
      var assertions = 0
      apis.forEach(api => {
        (api.staticMethods || []).forEach(method => {
          if (method.signatureParameters.length) {
            expect(method.signatureParameters).to.deep.equal(
              method.parameters.map(param => param.name),
              `${api.name}.${method.name}${method.signature} is missing parameter docs`
            )
            assertions++
          }
        })
      })
      expect(assertions).to.be.above(5)
    })
  })

  describe('Instance Methods', function () {
    they('have basic properties', function () {
      var method = apis.BrowserWindow.instanceMethods.setContentSize
      expect(method.name).to.eq('setContentSize')
      expect(method.signature).to.eq('(width, height[, animate])')
      expect(method.description).to.include('Resizes the window')
    })

    they('are defined for classes that are among many in a module', function () {
      expect(apis.WebRequest.instanceMethods.onBeforeRequest.signature).to.eq('([filter, ]listener)')
    })

    they('are defined for classes that are unique to a module', function () {
      expect(apis.NativeImage.instanceMethods.toJPEG.signature).to.eq('(quality)')
    })

    they('do not have a parameters array if they do not take parameters', function () {
      var method = JSON.parse(JSON.stringify(apis.BrowserWindowProxy.instanceMethods.blur))
      expect(method.name).to.equal('blur')
      expect(method.parameters).to.be.undefined
    })

    they('can have a platform array', function () {
      expect(apis.BrowserWindow.instanceMethods.setAspectRatio.platforms[0]).to.eq('macOS')
    })

    they('always have documented parameters', function () {
      var assertions = 0
      apis.forEach(api => {
        (api.instanceMethods || []).forEach(method => {
          if (method.signatureParameters.length) {
            if (method.parameters.length > 1 && method.parameters[1].name === '...args') return
            expect(JSON.stringify(method.signatureParameters)).to.equal(
              JSON.stringify(method.parameters.map(arg => arg.name)),
              `${api.name}.${method.name}${method.signature} is missing parameter docs`
            )
            assertions++
          }
        })
      })
      expect(assertions).to.be.above(80)
    })

    it('should have function parameters that then have deep documented parameters', function () {
      var method = apis.WebRequest.instanceMethods.onBeforeRequest
      var param = method.parameters[1]
      expect(param.type).to.equal('Function')
      expect(param.parameters).to.exist
      expect(param.parameters[0].type).to.equal('Object')
      expect(param.parameters[1].type).to.equal('Function')
      expect(param.parameters[1].parameters).to.exist
      expect(param.parameters[1].parameters[0].type).to.equal('Object')
      expect(param.parameters[1].parameters[0].properties).to.exist
      expect(param.parameters[1].parameters[0].properties[0].type).to.equal('Boolean')
    })
  })

  describe('Instance Properties', function () {
    they('are present on every class that should have them, with name and description', function () {
      var apisWithInstanceProperties = [
        'BrowserWindow',
        'MenuItem',
        'Menu',
        'Session',
        'WebContents'
      ]

      apisWithInstanceProperties.forEach(api => {
        var props = apis[api].instanceProperties
        expect(props).to.not.be.empty
        expect(props.every(prop => prop.name.length > 0)).to.be.true
        expect(props.every(prop => prop.description.length > 0)).to.be.true
      })
    })

    they('are absent from APIs that have no instance properties', function () {
      var api = JSON.parse(JSON.stringify(apis.NativeImage))
      expect(api.name).to.equal('NativeImage')
      expect(api.instanceProperties).to.be.undefined
    })

    they('have properly parsed name, description and type', function () {
      var props = apis.BrowserWindow.instanceProperties
      expect(props.length).to.equal(2)
      expect(props[0].name).to.equal('webContents')
      expect(props[0].description).to.include('object this window owns')
      expect(props[0].type).to.equal('WebContents')
      expect(props[1].name).to.equal('id')
      expect(props[1].description).to.equal('A Integer representing the unique ID of the window.')
      expect(props[1].type).to.equal('Integer')
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
      var properties = apis.Certificate.properties
      expect(properties.length).to.be.above(5)
      expect(properties[0].name).to.eq('data')
      expect(properties[0].type).to.eq('String')
      expect(properties[0].description).to.eq('PEM encoded data')
    })
  })

  describe('JSON serialization/stringification', function () {
    it('preserves desired properties and omits the unwanted ones', function () {
      var app = JSON.parse(JSON.stringify(apis.app))

      // common to all APIs
      expect(app.name).to.exist
      expect(app.description).to.exist
      expect(app.type).to.exist
      expect(app.slug).to.exist
      expect(app.websiteUrl).to.exist
      expect(app.repoUrl).to.exist

      // unwanted
      expect(app.errors).to.not.exist
      expect(app.docs).to.not.exist

      // events
      var _process = JSON.parse(JSON.stringify(apis.process))
      expect(_process.events).to.exist

      // instanceEvents
      var Tray = JSON.parse(JSON.stringify(apis.Tray))
      expect(Tray.instanceEvents).to.exist

      // methods
      var remote = JSON.parse(JSON.stringify(apis.remote))
      expect(remote.methods).to.exist

      // instanceMethods
      var win = JSON.parse(JSON.stringify(apis.BrowserWindow))
      expect(win.instanceMethods).to.exist
    })
  })

  describe('Convenience URLs', function () {
    it('sets a websiteUrl', function () {
      var url = 'http://electron.atom.io/docs/api/tray'
      expect(apis.Tray.websiteUrl).to.equal(url)
    })

    it('sets a repoUrl', function () {
      var url = 'https://github.com/electron/electron/blob/v1.2.3/docs/api/tray.md'
      expect(apis.Tray.repoUrl).to.equal(url)
    })
  })

  describe('Deep objects', function () {
    it('resolve deep objects as return values', function () {
      const method = apis.webFrame.methods.getResourceUsage
      expect(method.returns.type).to.equal('Object')
      expect(method.returns.properties.length).to.equal(5)
      method.returns.properties.forEach(prop => {
        expect(prop.type).to.equal('MemoryUsageDetails')
      })
    })

    it('resolves properties of objects as arrays correctly', function () {
      const method = apis.app.methods.getJumpListSettings
      expect(method.returns.type).to.equal('Object')
      expect(method.returns.properties[1].type).to.equal('JumpListItem[]')
    })
  })

  describe('Returns', function () {
    it('should set return types for methods that return a value', function () {
      const method = apis.app.methods.getName
      expect(method.returns).to.exist
      expect(method.returns.type).to.equal('String')
    })

    it('should not set return types for methods that return undefined', function () {
      const method = apis.app.methods.setName
      expect(method.returns).to.be.undefined
    })

    it('should strip and allow return types to be links', function () {
      const method = apis.BrowserWindow.instanceMethods.getContentBounds
      expect(method.returns).to.exist
      expect(method.returns.type).to.equal('Rectangle')
    })
  })

  describe('Structures', function () {
    var structs

    before(function () {
      structs = apis.filter(api => api.type === 'Structure')
    })
    it('should create API references for each of them', function () {
      expect(structs.length).to.be.gt(6)
    })

    it('should list properties for each struct', function () {
      structs.forEach(struct => {
        expect(struct.properties).to.exist
        expect(struct.properties.length).to.be.gt(0)
      })
    })
  })
})
