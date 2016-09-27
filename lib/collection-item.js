'use strict'

const omitEmpty = require('clean-deep')
const pick = require('lodash.pick')
const parsers = require('./parsers')
const assert = require('assert')

module.exports = class CollectionItem {
  constructor (api, openingHeadingElement, pattern, props) {
    assert(api, 'api is required')
    assert(openingHeadingElement, 'openingHeadingElement is required')
    assert(props, 'props are required')
    assert(pattern, 'pattern is required')

    this.props = props
    this.pattern = pattern
    this.$ = api.$
    this.api = api
    this.$openingHeadingElement = this.$(openingHeadingElement)

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
      this.$openingHeadingElement
    )
  }

  getDescription () {
    return parsers.description(this.$, this.$openingHeadingElement)
  }

  getPlatforms () {
    return parsers.platforms(this.$, this.$openingHeadingElement)
  }

  getParameters () {
    return parsers.parameters(this.$, this.$openingHeadingElement, this.api)
  }

  getReturns () {
    return parsers.returns(this.$, this.$openingHeadingElement, this.api)
  }

}
