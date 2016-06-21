const decamelize = require('decamelize')
const marky = require('marky-markdown-lite')
const omitEmpty = require('omit-empty')

module.exports = class Api {
  constructor(props) {
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop]
    })

    this.slug = decamelize(this.name, '-')
    this.websiteUrl = `http://electron.atom.io/docs/api/${this.slug}`
    this.repoUrl = `https://github.com/electron/electron/blob/v${process.versions.electron}/docs/api/${this.slug}.md`
    this.type = (this.name.charAt(0) === this.name.charAt(0).toLowerCase())
      ? 'Object'
      : 'Class'
  }

  document(docs) {
    var md = docs.find(doc => doc.slug === this.slug).markdown_content
    var $ = marky(md)

    this.description = $('blockquote > p').first().text()

    this.instanceMethods = require('./api/instance-methods')($)
    this.events = require('./api/events')($)
  }

  toJSON() {
    return omitEmpty(this)
  }

}
