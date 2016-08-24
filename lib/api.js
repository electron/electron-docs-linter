'use strict'

const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const omitEmpty = require('clean-deep')
const pick = require('lodash.pick')
const toMarkdown = require('to-markdown')
const revalidator = require('revalidator')
const schema = require('./schema')
const Collection = require('./collection')

class API {
  constructor (props, docs) {
    Object.assign(this, props)
    this.errors = []
    this.slug = decamelize(this.name, '-')
    this.websiteUrl = `http://electron.atom.io/docs/api/${this.slug}`
    this.repoUrl = `https://github.com/electron/electron/blob/v${this.version}/docs/api/${this.slug}.md`
    this.type = (this.name.charAt(0) === this.name.charAt(0).toLowerCase()) ? 'Module' : 'Class'

    this.parseDoc(docs)

    this.description = this.$('blockquote > p').first().text()

    if (this.type === 'Module') {
      this.events = new Collection('Event', this, '#events', 2)
      this.methods = new Collection('Method', this, '#methods', 2)
    }

    if (this.type === 'Class') {
      this.instanceEvents = new Collection('Event', this, `h3#class-${this.name}-instance-events`, 3)
      this.instanceMethods = new Collection('Method', this, `h3#class-${this.name}-instance-methods`, 3)
      this.instanceProperties = new Collection('Property', this, `h3#class-${this.name}-instance-properties`, 3)
      this.staticMethods = new Collection('Method', this, `h3#class-${this.name}-static-methods`, 3)
    }
  }

  get valid () {
    return revalidator.validate(this, schema).valid
  }

  get validationErrors () {
    return revalidator.validate(this, schema).errors
  }

  addError (type, pattern, html) {
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
      'events',
      'instanceEvents',
      'methods',
      'instanceProperties',
      'staticMethods',
      'instanceMethods'
    ]

    return omitEmpty(pick(this, props))
  }

  parseDoc (docs) {
    this.doc = docs.find(doc => doc.slug === this.parentDoc || doc.slug === this.slug)
    this.$ = marky(this.doc.markdown_content)
    this.classifyInstanceHeadings()
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
        lastClassName = match ? match[1] : null
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
