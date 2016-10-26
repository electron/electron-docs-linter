'use strict'

const CollectionItem = require('./collection-item')
const pattern = /<code>.*\.(\w+)<\/code>/
const typePattern = /An? ([a-zA-Z]+(?:\[\])?) ?/
const props = ['name', 'description', 'type']

module.exports = class Event extends CollectionItem {
  constructor (api, el) {
    super(api, el, pattern, props)

    if (this.match) {
      this.name = this.match[1]
      this.description = this.getDescription()
      this.type = null
      const typeMatch = typePattern.exec(this.description)
      if (typeMatch) {
        this.type = typeMatch[1]
      }
    }

    return this
  }
}
