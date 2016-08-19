'use strict'

const CollectionItem = require('./collection-item')
const pattern = /<code>.*\.(\w+)(.*)<\/code>/
const props = ['name', 'signature', 'platforms', 'description', 'arguments']

module.exports = class Method extends CollectionItem {
  constructor (api, el) {
    super(api, el, pattern, props)

    if (this.match) {
      this.name = this.match[1]
      this.signature = this.match[2]
      this.platforms = this.getPlatforms()
      this.description = this.getDescription()
      this.arguments = this.getArguments()
    }

    return this
  }
}
