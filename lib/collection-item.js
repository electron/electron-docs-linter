'use strict'

const omitEmpty = require('clean-deep')
const pick = require('lodash.pick')
const parsers = require('./parsers')

module.exports = class CollectionItem {
  constructor (api, openingHeadingElement, pattern, props) {
    if (!api) throw Error('api is required')
    if (!openingHeadingElement) throw Error('openingHeadingElement is required')
    if (!props) throw Error('props are required')
    if (!pattern) throw Error('pattern is required')

    this.props = props
    this.pattern = pattern
    this.$ = api.$
    this.api = api
    this.$openingHeadingElement = this.$(openingHeadingElement)

    // For 'h3', tagLevel will be 3
    const tagLevel = Number(this.$openingHeadingElement.get(0).tagName.charAt(1))

    // When we encounter the next heading of equal or greater weight,
    // stop traversing the DOM. For 'h3', nextUntil is 'h1, h2, h3'
    this.nextUntil = `h${tagLevel - 2}, h${tagLevel - 1}, h${tagLevel}`

    // Record a parsing error if pattern not satisfied
    if (!this.match) this.fail()
  }

  get match () {
    return this.$openingHeadingElement.html().match(this.pattern)
  }

  inspect () {
    return this.toJSON()
  }

  // When stringifying, only include the properties that are explicitly
  // specified in this.props
  toJSON () {
    return omitEmpty(pick(this, this.props))
  }

  fail () {
    this.api.addError(
      this.constructor.name,
      this.pattern,
      this.$openingHeadingElement.html()
    )
  }

  getDescription () {
    return parsers.description(this.$, this.$openingHeadingElement)
  }

  getPlatforms () {
    return parsers.platforms(this.$, this.$openingHeadingElement)
  }

  getParameters () {
    return parsers.parameters(this.$, this.$openingHeadingElement)
  }

}
