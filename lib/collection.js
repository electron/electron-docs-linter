'use strict'

const CollectionItemTypes = {
  Event: require('./event'),
  Method: require('./method'),
  Property: require('./property')
}

module.exports = class Collection {
  // new Collection('Event', api, '#events', 2)
  // new Collection('Method', api, '#methods', 2)
  // new Collection('Event', api, `h3#class-${api.name}-instance-events`, 3)
  constructor (type, api, selector, headingLevel) {
    return api.$(selector)
      .nextUntil(`h${headingLevel}`)
      .filter((i, el) => api.$(el).get(0).tagName === `h${headingLevel + 1}`)
      .map((i, el) => new CollectionItemTypes[type](api, el))
      .get()
  }
}
