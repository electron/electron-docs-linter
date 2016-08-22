'use strict'

const omitEmpty = require('clean-deep')
const cheerio = require('cheerio')
const pick = require('lodash.pick')

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
    return this.$openingHeadingElement
      .nextUntil(this.nextUntil)
      .filter((i, el) => this.$(el).get(0).tagName === 'p')
      .filter((i, el) => !this.$(el).text().match(/^Returns:/))
      .map((i, el) => this.$(el).text())
      .get()
      .join(' ')
      .replace(/\n/g, ' ')
  }

  getPlatforms () {
    return this.$openingHeadingElement
      .find('em')
      .map((i, el) => this.$(el).text())
      .get()
  }

  getArguments () {
    const argumentPattern = /<code>(\w+)<\/code>\s*(?:<a href.*>)?([a-zA-Z0-9\[\]]+)(?:<\/a>)?(?: - )?(.*)/
    const enumPattern = /<code>(\w+)<\/code>\s*(?: - )(.*)/

    return this.$openingHeadingElement
      .nextUntil(this.nextUntil)
      .filter((i, el) => this.$(el).get(0).tagName === 'ul')
      .find('> li')
      .map((i, el) => {
        var match = this.$(el).html()
          .split('\n')[0]
          .match(argumentPattern)

        // Parsing error
        if (!match) return this.api.addError('arguments', argumentPattern, this.$(el).html())

        // Preserve backticks
        var description = match[3].replace(/<\/?code>/g, '`')

        // Convert any lingering HTML to text
        description = cheerio.load(`<foo>${description}</foo>`)('foo').text().trim()

        var arg = {
          name: match[1],
          type: match[2],
          description: description
        }

        // The documentation style for events and function arguments
        // is very similar:
        //
        // `theProp` String - Some description
        //
        // However, one place where event and function arguments differ is that
        // arguments are sometimes required.
        if (this.constructor.name !== 'Event') {
          arg.required = !this.$(el).text().match('(optional)')
        }

        if (arg.type === 'Object') {
          // Parse arguments that have complex objects defined in sublists
          arg.properties = this.$(el)
            .find('li')
            .map((i, el) => {
              var match = this.$(el).html().match(argumentPattern)
              if (!match) return this.api.addError('argument subproperties', argumentPattern, this.$(el).html())
              return {
                name: match[1],
                type: match[2],
                description: match[3]
              }
            })
            .get()
        } else {
          // Parse non-object sublists as ENUM values
          // e.g. apis.WebContents.instanceMethods.savePage.arguments.saveType.possibleValues
          arg.possibleValues = this.$(el)
            .find('li')
            .map((i, el) => {
              var match = this.$(el).html().match(enumPattern)
              if (!match) return this.api.addError('argument ENUM values', enumPattern, this.$(el).html())
              return {
                value: match[1],
                description: match[2]
              }
            })
            .get()
        }

        return omitEmpty(arg)
      })
      .get()
  }

}
