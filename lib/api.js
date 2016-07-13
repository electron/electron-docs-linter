const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const omitEmpty = require('omit-empty')
const pick = require('lodash.pick')
const toMarkdown = require('to-markdown')
const revalidator = require('revalidator')
const schema = require('./api/schema')

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

    var collections = [
      {name: 'methods', selector: 'h2#methods', parser: 'methods'},
      {name: 'instanceMethods', selector: 'h2#instance-methods', parser: 'methods'},
      {name: 'events', selector: 'h2#events', parser: 'events'},
      {name: 'instanceEvents', selector: 'h3#instance-events', parser: 'events'}
    ]

    collections.forEach(_ => {
      const {name, selector, parser} = _
      this[name] = require(`./api/${parser}`)(this, selector)
    })
  }

  get valid () {
    return revalidator.validate(this, schema).valid
  }

  get validationErrors () {
    return revalidator.validate(this, schema).errors
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
      'process',
      'type',
      'slug',
      'websiteUrl',
      'repoUrl',
      'events',
      'instanceEvents',
      'methods',
      'instanceMethods'
    ]

    return omitEmpty(pick(this, props))
  }

}

module.exports = API
