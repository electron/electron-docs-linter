const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const omitEmpty = require('omit-empty')

class API {
  constructor (props, docs) {
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop]
    })

    this.slug = decamelize(this.name, '-')
    this.websiteUrl = `http://electron.atom.io/docs/api/${this.slug}`
    this.repoUrl = `https://github.com/electron/electron/blob/v${process.versions.electron}/docs/api/${this.slug}.md`
    this.type = (this.name.charAt(0) === this.name.charAt(0).toLowerCase())
      ? 'Object'
      : 'Class'

    this.document(docs)
  }

  document (docs) {
    var doc = docs.find(doc => doc.slug === this.slug)
    var $ = marky(doc.markdown_content)

    this.description = $('blockquote > p').first().text()
    this.instanceMethods = require('./api/instance-methods')($, doc)
    this.events = require('./api/events')($, doc)
  }

  toJSON () {
    return omitEmpty(this)
  }
}

module.exports = API
