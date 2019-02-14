const path = require('path')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const lint = require('..')
const they = it

const expect = chai.expect
chai.use(dirtyChai)

var apis

describe('APIs', function () {
  this.timeout(10 * 1000)

  before(function (done) {
    var docPath = path.join(__dirname, 'fixtures/electron/docs/api')
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
    expect(apis.every(api => api.name.length > 0)).to.be.true()
    expect(apis.every(api => api.slug.length > 0)).to.be.true()
    expect(apis.every(api => api.type.length > 0)).to.be.true()
    expect(apis.every(api => api.version.length > 0)).to.be.true()

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
    expect(apis.every(api => api.valid)).to.be.true()
  })

  describe('process', function () {
    it('is an object with `main` and `renderer` keys', function () {
      expect(apis.clipboard.process.main).to.equal(true)
      expect(apis.clipboard.process.renderer).to.equal(true)

      expect(apis.crashReporter.process.main).to.equal(true)
      expect(apis.crashReporter.process.renderer).to.equal(true)

      expect(apis.nativeImage.process.main).to.equal(true)
      expect(apis.nativeImage.process.renderer).to.equal(true)

      expect(apis.NativeImage.process.main).to.equal(true)
      expect(apis.NativeImage.process.renderer).to.equal(true)

      expect(apis.shell.process.main).to.equal(true)
      expect(apis.shell.process.renderer).to.equal(true)

      expect(apis.Tray.process.main).to.equal(true)
      expect(apis.Tray.process.renderer).to.equal(false)
    })

    it('is present on all APIs', function () {
      var nonStructures = apis.filter(api => api.type !== 'Structure')
      expect(nonStructures.length).to.be.above(30)
      nonStructures.forEach(api => {
        expect(api.process).to.be.an('object', `${api.name} is missing a process object`)
        expect(api.process.main).to.be.a('boolean', `${api.name} is missing process.main property`)
        expect(api.process.renderer).to.be.a('boolean', `${api.name} is missing process.renderer property`)
      })
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

    they('derive instanceName from name if no instance events/methods/properties exist', function () {
      expect(apis.TouchBar.staticProperties).to.exist()
      expect(apis.TouchBar.staticProperties.TouchBarGroup).to.exist()
      expect(apis.TouchBar.staticProperties.TouchBarGroup.instanceName).to.eq('touchBarGroup')
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

    they('exist on the webviewTag API', function () {
      expect(apis.webviewTag.methods).to.exist()
      expect(apis.webviewTag.methods).to.be.an('array')
      expect(apis.webviewTag.methods.length).to.be.above(5)
      apis.webviewTag.methods.forEach(method => {
        expect(method.name).to.exist()
        expect(method.description).to.exist()
      })
    })

    they('can return promises with inner types', function () {
      expect(apis.app.methods.isDefaultProtocolClient).to.exist()
      expect(apis.app.methods.isDefaultProtocolClient.returns.type).to.eq('Promise')
      expect(apis.app.methods.isDefaultProtocolClient.returns.innerType).to.eq('boolean')
    })

    they('can return promises with complex inner types', function () {
      expect(apis.app.methods.removeAsDefaultProtocolClient).to.exist()
      expect(apis.app.methods.removeAsDefaultProtocolClient.returns.type).to.eq('Promise')
      expect(apis.app.methods.removeAsDefaultProtocolClient.returns.innerType).to.deep.eq([
        {
          collection: false,
          innerType: undefined,
          typeName: 'Boolean'
        },
        {
          collection: false,
          innerType: undefined,
          typeName: 'null'
        },
        {
          collection: false,
          innerType: undefined,
          typeName: 'Point'
        },
        {
          collection: true,
          innerType: undefined,
          typeName: 'Rect'
        }
      ])
    })
  })

  describe('Parameters', function () {
    it('preserves backticked code in descriptions and converts HTML to text', function () {
      var callback = apis.WebContents.instanceMethods.savePage.parameters.callback
      expect(callback.description).to.equal('`(error) => {}`.')

      var properties = apis.BrowserWindow.constructorMethod.parameters[0].properties
      expect(properties.some(p => p.description.includes('Default is true'))).to.eq(true)
      expect(properties.some(p => p.description.includes('Default is false'))).to.eq(true)
      expect(properties.some(p => p.description.includes('Default is .'))).to.eq(false)
    })

    it('detects when parameters are required', function () {
      const params = apis.app.methods.setAsDefaultProtocolClient.parameters
      expect(params.protocol.required).to.equal(true)
      expect(params.path.required).to.equal(false)
    })

    they('can have descriptions that span multiple lines', function () {
      var method = apis.BrowserWindow.instanceMethods.setAspectRatio.parameters.extraSize
      expect(method.description).to.equal('The extra size not to be included while maintaining the aspect ratio.')
    })

    they('have a `required` key for events', function () {
      var keys = Object.keys(apis.app.events.activate.returns.hasVisibleWindows)
      expect(keys).to.include('name')
      expect(keys).to.include('type')
      expect(keys).to.include('required')
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
      expect(props.screenPosition).to.exist()
      expect(props.screenSize).to.exist()

      // nested
      expect(props.desktop).to.be.undefined()
      expect(props.mobile).to.be.undefined()
      expect(props.width).to.be.undefined()
      expect(props.height).to.be.undefined()
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
      expect(param.possibleValues).to.be.undefined()
    })

    they('support return types consisting of multiple types', function () {
      var param = apis.ClientRequest.instanceMethods.write.parameters[0]
      expect(param.type).to.be.an('array')
      expect(param.type).to.deep.equal([{
        typeName: 'String',
        innerType: undefined,
        collection: false
      }, {
        typeName: 'Buffer',
        innerType: undefined,
        collection: false
      }])
    })

    they('support return types consisting of multiple complex types', function () {
      var param = apis.Session.instanceMethods.setPermissionRequestHandler.parameters[0]
      expect(param.type).to.be.an('array')
      expect(param.type[0].typeName).to.equal('Function')
      expect(param.type[1].typeName).to.equal('null')
      expect(param, 'should have function parameters').to.have.property('parameters')
    })

    they('can be promises with inner types', function () {
      var param = apis.app.methods.isDefaultProtocolClient.parameters[0]
      expect(param.type).to.eq('Promise')
      expect(param.innerType).to.eq('String')
    })
  })

  describe('Static Methods', function () {
    they('have basic properties', function () {
      var method = apis.BrowserWindow.staticMethods.getAllWindows
      expect(method.name).to.eq('getAllWindows')
      expect(method.signature).to.eq('()')
      expect(method.description).to.eq('')
      expect(method.returns.type).to.eq('BrowserWindow')
      expect(method.returns.collection).to.eq(true)
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
      expect(assertions).to.be.above(3)
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
      expect(method.parameters).to.be.undefined()
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
      expect(param.parameters).to.exist()
      expect(param.parameters[0].type).to.equal('Object')
      expect(param.parameters[1].type).to.equal('Function')
      expect(param.parameters[1].parameters).to.exist()
      expect(param.parameters[1].parameters[0].type).to.equal('Object')
      expect(param.parameters[1].parameters[0].properties).to.exist()
      expect(param.parameters[1].parameters[0].properties[0].type).to.equal('Boolean')
    })
  })

  describe('Properties', function () {
    they('are marked `required` for super objects', function () {
      apis.app.properties.forEach(prop => expect(prop.required).to.equal(true))
    })

    they('can be promises with inner types', function () {
      var prop = apis.BrowserWindow.instanceProperties.id
      expect(prop.type).to.eq('Promise')
      expect(prop.innerType).to.eq('Integer')
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
        expect(props).to.not.be.empty()
        expect(props.every(prop => prop.name.length > 0)).to.be.true()
        expect(props.every(prop => prop.description.length > 0)).to.be.true()
      })
    })

    they('are absent from APIs that have no instance properties', function () {
      var api = JSON.parse(JSON.stringify(apis.NativeImage))
      expect(api.name).to.equal('NativeImage')
      expect(api.instanceProperties).to.be.undefined()
    })

    they('have properly parsed name, description and type', function () {
      var props = apis.BrowserWindow.instanceProperties
      expect(props.length).to.equal(2)
      expect(props[0].name).to.equal('webContents')
      expect(props[0].description).to.include('object this window owns')
      expect(props[0].type).to.equal('WebContents')
      expect(props[1].name).to.equal('id')
      expect(props[1].description).to.equal('A Promise<Integer> representing the unique ID of the window.')
      expect(props[1].type).to.equal('Promise')
    })
  })

  describe('Events', function () {
    it('is an array of event objects', function () {
      expect(apis.app.events.length).to.be.above(10)
      expect(apis.app.events.every(event => event.name.length > 0)).to.be.true()
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
      expect(app.name).to.exist()
      expect(app.description).to.exist()
      expect(app.type).to.exist()
      expect(app.slug).to.exist()
      expect(app.websiteUrl).to.exist()
      expect(app.repoUrl).to.exist()
      expect(app.version).to.exist()

      // unwanted
      expect(app.errors).to.not.exist()
      expect(app.docs).to.not.exist()

      // events
      var _process = JSON.parse(JSON.stringify(apis.process))
      expect(_process.events).to.exist()

      // instanceEvents
      var Tray = JSON.parse(JSON.stringify(apis.Tray))
      expect(Tray.instanceEvents).to.exist()

      // methods
      var remote = JSON.parse(JSON.stringify(apis.remote))
      expect(remote.methods).to.exist()

      // instanceMethods
      var win = JSON.parse(JSON.stringify(apis.BrowserWindow))
      expect(win.instanceMethods).to.exist()
    })
  })

  describe('Attributes', function () {
    they('exist on the webviewTag API', function () {
      expect(apis.webviewTag.attributes).to.exist()
      expect(apis.webviewTag.attributes).to.be.an('array')
      expect(apis.webviewTag.attributes.length).to.be.above(5)
      apis.webviewTag.attributes.forEach(attr => {
        expect(attr.name).to.exist()
        expect(attr.description).to.exist()
      })
    })
  })

  describe('Convenience URLs', function () {
    it('sets a websiteUrl', function () {
      var url = 'http://electronjs.org/docs/api/tray'
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
      expect(method.returns.properties[1].type).to.equal('JumpListItem')
      expect(method.returns.properties[1].collection).to.equal(true)
    })

    it('resolve promises in deep objects as return values', function () {
      const method = apis.screen.methods.getCursorScreenPoint
      expect(method.returns.type).to.equal('Object')
      expect(method.returns.properties.length).to.equal(2)
      const prop = method.returns.properties[0]
      expect(prop.name).to.eq('x')
      expect(prop.type).to.eq('Promise')
      expect(prop.innerType).to.eq('Integer')
    })
  })

  describe('Returns', function () {
    it('should set return types for methods that return a value', function () {
      const method = apis.app.methods.getName
      expect(method.returns).to.exist()
      expect(method.returns.type).to.equal('String')
    })

    it('should not set return types for methods that return undefined', function () {
      const method = apis.app.methods.setName
      expect(method.returns).to.be.undefined()
    })

    it('should strip and allow return types to be links', function () {
      const method = apis.BrowserWindow.instanceMethods.getContentBounds
      expect(method.returns).to.exist()
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
        expect(struct.properties).to.exist()
        expect(struct.properties.length).to.be.gt(0)
        struct.properties.forEach(prop => expect(prop.required).to.exist)
      })
    })

    it('should have "extends" for structures that extend other structures', () => {
      expect(apis.Event).to.have.property('extends')
        .that.is.a('string')
        .and.is.equal('GlobalEvent')
    })
  })

  describe('Elements', function () {
    they('have a type property of `Element`', function () {
      expect(apis.webviewTag.type).to.eq('Element')
    })
  })
})
