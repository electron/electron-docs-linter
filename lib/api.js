const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const omitEmpty = require('omit-empty')
const pick = require('lodash.pick')

class API {
  constructor (props, docs) {
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop]
    })
    this.slug = decamelize(this.name, '-')
    this.websiteUrl = `http://electron.atom.io/docs/api/${this.slug}`
    this.repoUrl = `https://github.com/electron/electron/blob/v${process.versions.electron}/docs/api/${this.slug}.md`
    this.type = (this.name.charAt(0) === this.name.charAt(0).toLowerCase()) ? 'Object' : 'Class'

    this.doc = docs.find(doc => doc.slug === this.slug)
    this.$ = marky(this.doc.markdown_content)

    this.description = this.$('blockquote > p').first().text()
    this.instanceMethods = require('./api/instance-methods')(this)
    this.events = require('./api/events')(this)
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
      'instanceMethods'
    ]

    return omitEmpty(pick(this, props))
  }

}

module.exports = API
