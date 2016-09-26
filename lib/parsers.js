const cheerio = require('cheerio')
const omitEmpty = require('clean-deep')
const entities = require('entities')

module.exports = {
  // Find all paragraphs in a swath
  description: ($, openingHeadingElement) => {
    return swath($, openingHeadingElement)
      .filter((i, el) => $(el).get(0).tagName === 'p')
      .filter((i, el) => !$(el).text().match(/^Returns:/))
      .map((i, el) => $(el).text())
      .get()
      .join(' ')
      .replace(/\n/g, ' ')
  },

  // Find all <em> tags in the heading
  platforms: ($, openingHeadingElement) => {
    return $(openingHeadingElement)
      .find('em')
      .map((i, el) => $(el).text())
      .get()
  },

  // Find parameters in the first <ul> in the swath
  parameters: ($, openingHeadingElement, api) => {
    const parameterPattern = /<code>(\w+)<\/code>\s*(?:<a href.*>)?([a-zA-Z0-9\[\]]+)(?:<\/a>)?(?: - )?([\s\S]*)/m
    const enumPattern = /<code>([-\w]+)<\/code>\s*(?: - )([\s\S]*)/
    const sanitizeDescription = (description) => {
      return description
      .replace(/\n/g, ' ') // newlines to spaces
      .replace(/\s+/g, ' ') // remove extra spaces
      .trim()
    }

    return swath($, openingHeadingElement)
      .filter((i, el) => $(el).get(0).tagName === 'ul')
      .first()
      .find('> li')
      .map((i, el) => {
        var match = $(el).html()
          .match(parameterPattern)

        // // Parsing error
        if (!match) return api.addError('parameters', parameterPattern, $(el))

        // Preserve backticks
        var description = match[3].replace(/<\/?code>/g, '`')

        // Convert any lingering HTML to text
        description = cheerio.load(`<foo>${description}</foo>`)('foo')
          .contents()
          .filter(function () { return this.type === 'text' }) // avoid nested ULs
          .text()

        var arg = {
          name: match[1],
          type: match[2],
          description: sanitizeDescription(description)
        }

        // // The documentation style for events and function parameters
        // // is very similar:
        // //
        // // `theProp` String - Some description
        // //
        // // However, one place where event and function parameters differ is that
        // // parameters are sometimes required.
        // if (this.constructor.name !== 'Event') {
        //   arg.required = !$(el).text().match('(optional)')
        // }

        if (arg.type === 'Object') {
          // Parse parameters that have complex objects defined in sublists
          arg.properties = $(el)
            .find('li')
            .map((i, el) => {
              var match = $(el).html().match(parameterPattern)
              if (!match) return api.addError('parameter subproperties', parameterPattern, $(el))
              return {
                name: match[1],
                type: match[2],
                description: sanitizeDescription(match[3])
              }
            })
            .get()
        }

        // Parse string sublists as ENUM values
        // e.g. apis.WebContents.instanceMethods.savePage.parameters.saveType.possibleValues
        if (arg.type === 'String') {
          arg.possibleValues = $(el)
            .find('li')
            .map((i, el) => {
              var match = $(el).html().match(enumPattern)
              if (!match) return api.addError('parameter ENUM values', enumPattern, $(el))
              return {
                value: match[1],
                description: sanitizeDescription(match[2])
              }
            })
            .get()

          if (!arg.possibleValues.length) delete arg.possibleValues
        }

        return omitEmpty(arg)
      })
      .get()
  }
}

// Gather all DOM elements between the given h(2|3|4)
// and the next heading of the same level
function swath ($, openingHeadingElement) {
  const $el = $(openingHeadingElement)

  // For 'h3', tagLevel will be 3
  const tagLevel = Number($el.get(0).tagName.charAt(1))

  // When we encounter the next heading of equal or greater weight,
  // stop traversing the DOM. For 'h3', nextUntil is 'h1, h2, h3'
  const nextUntil = `h${tagLevel - 2}, h${tagLevel - 1}, h${tagLevel}`

  return $el.nextUntil(nextUntil)
}
