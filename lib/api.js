'use strict'

const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const cleanDeep = require('clean-deep')
const pick = require('lodash.pick')
const revalidator = require('revalidator')
const schemata = require('./schemata')
const parsers = require('./parsers')
const Collection = require('./collection')

class API {
  constructor (props, docs) {
    Object.assign(this, props)
    this.slug = this.parseSlug()
    this.websiteUrl = `http://electron.atom.io/docs/api/${props.structure ? 'structures/' : ''}${this.slug}`
    this.repoUrl = `https://github.com/electron/electron/blob/v${this.version}/docs/api/${props.structure ? 'structures/' : ''}${this.slug}.md`
    this.type = props.structure ? 'Structure' : (this.name.charAt(0) === this.name.charAt(0).toLowerCase()) ? 'Module' : 'Class'
    this.parseDoc(docs)
    this.description = this.parseDescription()
    this.process = this.parseProcesses()

    if (this.type === 'Module') {
      const subObjects = {}
      this.events = new Collection('Event', this, '#events', 2)
      this.properties = new Collection('Property', this, `#properties`, 2)
      this.methods = new Collection('Method', this, '#methods', 2).filter(method => {
        if (!method._superObject) return true
        subObjects[method._superObject] = subObjects[method._superObject] || {
          name: method._superObject,
          type: 'Object',
          properties: []
        }
        method.type = 'Function'
        method.props.pop(method.props.length - 1)
        method.props.push('type')
        subObjects[method._superObject].properties.push(method)
        return false
      })
      Object.keys(subObjects).forEach(subPropKey => this.properties.push(subObjects[subPropKey]))
    }

    if (this.type === 'Class') {
      this.instanceEvents = new Collection('Event', this, `h3#class-${this.slug}-instance-events`, 3)
      this.instanceMethods = new Collection('Method', this, `h3#class-${this.slug}-instance-methods`, 3)
      this.instanceProperties = new Collection('Property', this, `h3#class-${this.slug}-instance-properties`, 3)
      this.staticMethods = new Collection('Method', this, `h3#class-${this.slug}-static-methods`, 3)
      this.constructorMethod = this.parseConstructor()
      this.instanceName = this.parseInstanceName()
    }

    if (this.type === 'Structure') {
      this.properties = parsers.generateObjectProps(this.$, this.$('ul').first(), this)
    }
  }

  get valid () {
    return this.validSchema && this.collectionErrors.length === 0
  }

  get validateSchema () {
    return revalidator.validate(this, schemata[this.type])
  }

  get validSchema () {
    return this.validateSchema.valid
  }

  get validationErrors () {
    if (this.validSchema) return []
    return this.validateSchema.errors.map(error => `${error.property} ${error.message}`)
  }

  // Check that each collection includes the same number of valid items
  // as there are headings in the source document. If number does not match,
  // then some items in the collection failed to parse properly
  get collectionErrors () {
    // return cached errors if they were already computed
    if (this._collectionErrors) return this._collectionErrors

    var errors = []
    Collection.types.forEach(collection => {
      if (!this.expectedCounts) return
      const expected = this.expectedCounts[collection]
      const actual = this[collection] ? this[collection].length : 0
      if (expected && expected > actual) {
        const names = this[collection].map(item => item.name).join(', ')
        errors.push(`expected ${expected} ${collection} but only found ${actual}: ${names}`)
      }
    })

    // cache the result to avoid excess computation
    this._collectionErrors = errors
    return errors
  }

  report () {
    if (this.valid) return `✓ ${this.name}`

    var errors = this.validationErrors.concat(this.collectionErrors)
    return `✘ ${this.name}\n${errors.map(e => `  - ${e}`)}`
  }

  inspect () {
    return this.toJSON()
  }

  toJSON () {
    var props = [
      'name',
      'description',
      'process',
      'version',
      'type',
      'slug',
      'websiteUrl',
      'repoUrl',
      'methods',
      'events',
      'staticMethods',
      'constructorMethod',
      'instanceName',
      'instanceMethods',
      'instanceProperties',
      'instanceEvents',
      'properties'
    ]

    return cleanDeep(pick(this, props))
  }

  parseDoc (docs) {
    this.doc = docs.find(doc => doc.slug === this.slug)

    if (!this.doc) {
      throw (new Error(`${this.name} does not appear to have a source document`))
    }

    this.$ = marky(this.doc.markdown_content)
    this.classifyInstanceHeadings()
  }

  parseDescription () {
    if (this.type === 'Class') {
      return this.$(`#class-${this.slug.replace(/-/g, '')}`)
        .next('blockquote').find('p').first().text()
    } else {
      return this.$('blockquote > p').first().text()
    }
  }

  parseConstructor () {
    const $heading = this.$('h3')
      .filter((i, el) => this.$(el).text().match(`new ${this.name}`))
      .first()

    if (!$heading || !$heading.length) return

    const pattern = /<code>new \w+(.*)<\/code>/
    const match = $heading.html().match(pattern)

    if (!match) return

    return {
      signature: match[1],
      parameters: parsers.parameters(this.$, $heading, this)
    }
  }

  parseInstanceName () {
    var $heading = (this.$('[id$="instance-methods"]'))
    if (!$heading.length) $heading = this.$('[id$="instance-properties"]')
    if (!$heading.length) return

    $heading = $heading
      .nextUntil('h3')
      .filter((i, el) => this.$(el).get(0).tagName === `h4`)
      .first()

    if ($heading.length) return $heading.text().split('.')[0]
  }

  parseProcesses () {
    const processes = this.$('p')
      .filter((i, el) => this.$(el).text().match(/^Process: /))
      .first()
      .html()

    // structures don't have a process annotation
    if (!processes) return

    return {
      main: !!processes.match('Main'),
      renderer: !!processes.match('Renderer')
    }
  }

  parseSlug () {
    if (this.name.match(/webview/i)) return 'webview-tag'
    return decamelize(this.name, '-')
  }

  // Apply DOM IDs to H3s that follow a class definition
  //
  // Examples:
  // class-WebContents-instance-properties
  // class-Debugger-instance-methods
  // class-Debugger-instance-events
  // class-BrowserWindowProxy-instance-methods
  //
  classifyInstanceHeadings () {
    let $ = this.$
    let classHeadingPattern = /^Class: (.*)$/
    let knownInstanceLabels = Collection.types.map(type => decamelize(type, '-'))
    let lastClassName = null
    $('h2,h3').each(function (i, el) {
      let tag = $(el).get(0).name
      let match = $(el).text().match(classHeadingPattern)

      if (tag === 'h2') {
        lastClassName = match ? decamelize(match[1], '-') : null
      }

      if (tag === 'h3' && lastClassName) {
        let instanceLabel = $(el).text().toLowerCase().replace(/\s+/g, '-')
        if (knownInstanceLabels.indexOf(instanceLabel) > -1) {
          let id = `class-${lastClassName}-${instanceLabel}`
          $(el).attr('id', id)
        }
      }
    })
  }
}

module.exports = API
