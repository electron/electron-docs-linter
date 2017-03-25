'use strict'

const decamelize = require('decamelize')
const CollectionItemTypes = {
  Event: require('./event'),
  Method: require('./method'),
  Property: require('./property'),
  Attribute: require('./attribute')
}

class Collection {
  // new Collection('Event', api, '#events', 2)
  // new Collection('Method', api, '#methods', 2)
  // new Collection('Event', api, `h3#class-${api.name}-instance-events`, 3)
  constructor (type, api, selector, headingLevel) {
    const list = api.$(selector)
      .nextUntil(`h${headingLevel}`)
      .filter((i, el) => api.$(el).get(0).tagName === `h${headingLevel + 1}`)

    // Count how many headings are present in this swath. This count will
    // later be used to verify all items in the Collection were properly parsed
    api.expectedCounts = api.expectedCounts || {}
    Collection.types.forEach(collectionType => {
      const selectorPattern = new RegExp(`${decamelize(collectionType, '-')}$`)
      if (selector.match(selectorPattern)) {
        api.expectedCounts[collectionType] = list.length
      }
    })

    return list
      .map((i, el) => new CollectionItemTypes[type](api, el))
      .get()
      .filter(item => item.valid)
  }
}

Collection.types = [
  'instanceEvents',
  'instanceMethods',
  'instanceProperties',
  'staticMethods',
  'staticProperties',
  'attributes'
]

module.exports = Collection
