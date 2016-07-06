const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const omitEmpty = require('omit-empty')
const pick = require('lodash.pick')
const toMarkdown = require('to-markdown')

class API {
  constructor (props, docs) {
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop]
    })
    this.errors = []
    this.slug = decamelize(this.name, '-')
    this.websiteUrl = `http://electron.atom.io/docs/api/${this.slug}`
    this.repoUrl = `https://github.com/electron/electron/blob/v${this.version}/docs/api/${this.slug}.md`
    this.type = (this.name.charAt(0) === this.name.charAt(0).toLowerCase()) ? 'Object' : 'Class'

    this.doc = docs.find(doc => doc.slug === this.slug)
    this.$ = marky(this.doc.markdown_content)

    this.description = this.$('blockquote > p').first().text()
    this.instanceMethods = require('./api/instance-methods')(this)
    this.events = require('./api/events')(this)
  }

  addError (type, html) {
    this.errors.push({
      type: type,
      filename: this.doc.filename,
      html: html,
      markdownGuess: toMarkdown(html)
    })
  }

  toJSON () {
    var props = [
      'name',
      'description',
      'mainProcess',
      'rendererProcess',
      'type',
      'slug',
      'websiteUrl',
      'repoUrl',
      'events',
      'instanceEvents',
      'instanceMethods'
    ]

    return omitEmpty(pick(this, props))
  }

}

module.exports = API
