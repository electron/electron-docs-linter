'use strict'

const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const cleanDeep = require('clean-deep')
const pick = require('lodash.pick')
const toMarkdown = require('to-markdown')
const revalidator = require('revalidator')
const schema = require('./schema')
const parsers = require('./parsers')
const Collection = require('./collection')

class API {
  constructor (props, docs) {
    Object.assign(this, props)
    this.errors = []
    this.slug = decamelize(this.name, '-')
    this.websiteUrl = `http://electron.atom.io/docs/api/${props.structure ? 'structures/' : ''}${this.slug}`
    this.repoUrl = `https://github.com/electron/electron/blob/v${this.version}/docs/api/${props.structure ? 'structures/' : ''}${this.slug}.md`
    this.type = props.structure ? 'Structure' : (this.name.charAt(0) === this.name.charAt(0).toLowerCase()) ? 'Module' : 'Class'

    this.parseDoc(docs)

    if (this.parentDoc) {
      this.description = this.$(`#class-${this.slug.replace(/-/g, '')}`).next('blockquote').find('p').first().text()
    } else {
      this.description = this.$('blockquote > p').first().text()
    }

    if (this.type === 'Module') {
      const subObjects = {}
      this.events = new Collection('Event', this, '#events', 2)
      this.properties = new Collection('Property', this, `#properties`, 2)
      this.methods = new Collection('Method', this, '#methods', 2).filter(method => {
        if (!method._superObject) return true
        const target = subObjects[method._superObject] = subObjects[method._superObject] || {
          name: method._superObject,
          type: 'Object',
          properties: []
        }
        delete method._superObject
        method.type = 'Function'
        method.props.pop(method.props.length - 1)
        method.props.push('type')
        target.properties.push(method)
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
    }

    if (this.type === 'Structure') {
      this.properties = parsers.generateObjectProps(this.$, this.$('ul').first(), this)
    }
  }

  get valid () {
    return revalidator.validate(this, schema).valid
  }

  get validationErrors () {
    return revalidator.validate(this, schema).errors
  }

  addError (type, pattern, $el) {
    var html = $el.html()

    this.errors.push({
      type: type,
      filename: this.doc.filename,
      pattern: pattern,
      html: html,
      markdownGuess: toMarkdown(html)
    })
  }

  logErrors () {
    if (!this.errors || !this.errors.length) return

    this.errors.forEach(err => {
      console.error('-----------------------')
      console.error(`file: ${err.filename}`)
      console.error(`type: ${err.type}`)
      console.error(`pattern: ${err.pattern}`)
      console.error(`html: ${err.html}`)
      console.error(`markdown (approximate): ${err.markdownGuess}`)
    })
  }

  inspect () {
    return this.toJSON()
  }

  toJSON () {
    var props = [
      'name',
      'description',
      'process',
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
    this.doc = docs.find(doc => doc.slug === this.parentDoc || doc.slug === this.slug)

    if (!this.doc) {
      throw (new Error(`${this.name} does not appear to have a source document`))
    }

    this.$ = marky(this.doc.markdown_content)
    this.classifyInstanceHeadings()
  }

  parseConstructor () {
    const $heading = this.$('h3')
      .filter((i, el) => this.$(el).text().match(`new ${this.name}`))
      .first()

    if (!$heading || !$heading.length) return

    const pattern = /<code>new \w+(.*)<\/code>/
    const match = $heading.html().match(pattern)

    if (!match) return this.addError('constructor parameters', pattern, $heading)

    return {
      signature: match[1],
      parameters: parsers.parameters(this.$, $heading, this)
    }
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
    let knownInstanceLabels = [
      'instance-events',
      'instance-methods',
      'instance-properties',
      'static-methods'
    ]
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
