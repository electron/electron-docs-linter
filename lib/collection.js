const CollectionItemTypes = {
  Event: require('./event'),
  Method: require('./method')
}

module.exports = class Collection {
  // new Collection('Event', api, '#events', 2)
  constructor (type, api, selector, headingLevel) {
    return api.$(selector)
      .nextUntil(`h${headingLevel}`)
      .filter((i, el) => api.$(el).get(0).tagName === `h${headingLevel + 1}`)
      .map((i, el) => {
        return new CollectionItemTypes[type](api, el)
      })
      .get()
  }
}
