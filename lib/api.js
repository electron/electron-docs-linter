const decamelize = require('decamelize')
const props = Object.getOwnPropertyNames
const marky = require('marky-markdown-lite')

module.exports = class Api {
  constructor(props) {
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop]
    })

    this.slug = decamelize(this.name, '-')
    this.website_url = `http://electron.atom.io/docs/api/${this.slug}`
    this.github_docs_url = `https://github.com/electron/electron/blob/v${process.versions.electron}/docs/api/${this.slug}.md`
    this.type = (this.name.charAt(0) === this.name.charAt(0).toLowerCase())
      ? 'Object'
      : 'Class'
  }

  document(docs) {
    var md = docs.find(doc => doc.slug === this.slug).markdown_content
    var $ = marky(md)
    this.description = $('blockquote > p').first().text()

    if (this.type === 'Class') {
      this.instance_methods = []
      $('#instance-methods')
        .nextUntil('h2')
        .filter((i,el) => $(el).get(0).tagName === 'h3')
        .each((i,el) => {
          var parts = $(el).find('code').text().match(/.*\.(\w+)(.*)/)
          var method = {
            name: parts[1],
            signature: parts[2]
          }
          this.instance_methods.push(method)
        })
    }
  }

}
