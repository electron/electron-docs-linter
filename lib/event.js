'use strict'

const CollectionItem = require('./collection-item')
const pattern = /Event: &apos;(.*)&apos;/
const props = ['name', 'description', 'platforms', 'returns']

module.exports = class Event extends CollectionItem {
  constructor (api, el) {
    super(api, el, pattern, props)

    if (this.match) {
      this.name = this.match[1]
      this.description = this.getDescription()
      this.platforms = this.getPlatforms()
      this.returns = this.getParameters()
    }

    return this
  }
}
