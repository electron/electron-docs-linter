'use strict'

const CollectionItem = require('./collection-item')
const pattern = /<code>(.*)<\/code>/
const props = ['name', 'description', 'platforms']

module.exports = class Attribute extends CollectionItem {
  constructor (api, el) {
    super(api, el, pattern, props)

    console.log('hello from attribute constructor')

    if (this.match) {
      this.name = this.match[1]
      this.description = this.getDescription()
      this.platforms = this.getPlatforms()
    }

    return this
  }
}
