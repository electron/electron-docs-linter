'use strict'

const cheerio = require('cheerio')
const cleanDeep = require('clean-deep')
const entities = require('entities')

const parameterPattern = /<code>(\w+?)<\/code>\s*\(?((?:(?:<a href.*?>)?[a-zA-Z0-9\[\]]+(?:<\/a>)?(?: \| )?)+)\)?(?: - )?([\s\S]*)/m
const methodReturnPattern = /^Returns (<a.+?>)?<code>(.*?)<\/code>(<\/a>)?/g
const multiTypePattern = /(?:<a href.*?>)?([a-zA-Z0-9\[\]]+)(?:<\/a>)?(?: \| )?/mg

const multitypify = (typeString) => {
  const types = []
  let t = multiTypePattern.exec(typeString)
  while (t) {
    types.push(t[1])
    t = multiTypePattern.exec(typeString)
  }
  multiTypePattern.lastIndex = 0
  // If there is one type, return as a string, else return an array of all the types
  return types.length === 1 ? types[0] : types
}
const textify = ($, things) => {
  return things.map((i, el) => $(el).text())
    .get()
    .join(' ')
    .replace(/\n/g, ' ')
}
const htmlify = ($, things) => {
  return things.map((i, el) => $(el).html())
    .get()
    .join('')
}
const sanitizeDescription = (description) => {
  return entities.decodeHTML(description
    .replace(/\n/g, ' ') // newlines to spaces
    .replace(/\s+/g, ' ') // remove extra spaces
    .trim()
  )
}
const getPossibleValues = ($, el, description, api) => {
  const enumPattern = /<code>([-\w]+)<\/code>\s*(?: - )([\s\S]*)/
  let possibleValues = $(el)
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
  if (possibleValues.length) return possibleValues
  if (!description) return []

  const inlineValuesPattern = /(?:can be|values include) ((?:(?:`[a-zA-Z\-]+`)(?:, ))*(?:`[a-zA-Z\-]+`)?(?: (?:or|and) `[a-zA-Z\-]+`)?)/i
  const inlineMatch = inlineValuesPattern.exec(description)
  if (inlineMatch) {
    const valueString = inlineMatch[1]
    const valuePattern = /`([a-zA-Z\-]+)`/g
    let value = valuePattern.exec(valueString)

    while (value) {
      possibleValues.push({
        value: value[1]
      })
      value = valuePattern.exec(valueString)
    }
  }
  return possibleValues
}
const generateObjectProps = ($, topUL, api) => {
  return topUL.find('> li')
    .map((i, el) => {
      var match = $(el).html().match(parameterPattern)
      if (!match) return api.addError('parameter subproperties', parameterPattern, $(el))
      let parameters
      let properties
      let possibleValues
      let description = match[3]

      // Convert any lingering HTML to text
      description = cheerio.load(`<foo>${description}</foo>`)('foo')
        .contents()
        .filter(function () { return this.type === 'text' }) // avoid nested ULs
        .text()

      const ret = {
        name: match[1],
        type: multitypify(match[2]),
        description: sanitizeDescription(description)
      }
      if (ret.type === 'Object') {
        properties = []
        const innerProps = $(el).find('> ul')
        if (innerProps.length === 1) {
          properties = generateObjectProps($, innerProps, api)
        }
      }
      if (ret.type === 'Function') {
        parameters = []
        const innerParams = $(el).find('> ul')
        if (innerParams.length === 1) {
          parameters = generateObjectProps($, innerParams, api, true)
        }
      }
      if (ret.type === 'String') {
        possibleValues = getPossibleValues($, el, sanitizeDescription($(el).html().replace(/<code>/g, '`').replace(/<\/code>/g, '`')), api)
        if (!possibleValues.length) possibleValues = null
      }
      if (properties) ret.properties = properties
      if (parameters) ret.parameters = parameters
      if (possibleValues) ret.possibleValues = possibleValues
      return ret
    })
    .get()
}

module.exports = {
  generateObjectProps,
  // Find all paragraphs in a swath
  description: ($, openingHeadingElement) =>
    textify($, swath($, openingHeadingElement)
      .filter((i, el) => $(el).get(0).tagName === 'p')
      .filter((i, el) => !$(el).text().match(/^Returns:/))
      .filter((i, el) => !$(el).html().match(methodReturnPattern))),

  // Find the return paragraph in a swath
  returns: ($, openingHeadingElement, api) => {
    const returnPara = swath($, openingHeadingElement)
      .filter((i, el) => $(el).get(0).tagName === 'p')
      .filter((i, el) => $(el).html().match(methodReturnPattern))
    const returnText = textify($, returnPara).trim()
    const returnHTML = htmlify($, returnPara).trim()
    let type = 'undefined'
    let description = ''
    let properties

    if (returnText) {
      type = methodReturnPattern.exec(returnHTML)[2]
      description = returnText.split(`Returns ${type}`)[1].replace(/^ - /g, '').replace(/^:/g, '').trim()
    }
    if (type === 'Object') {
      properties = []
      const props = swath($, openingHeadingElement)
        .filter((i, el) => $(el).get(0).tagName === 'ul')
      if (props) {
        properties = generateObjectProps($, props, api)
      }
    }
    if (type === 'undefined') return
    return {
      type,
      description: sanitizeDescription(description),
      properties
    }
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
    const mSwath = swath($, openingHeadingElement)

    return mSwath
      .filter((i, el) => {
        if ($(el).get(0).tagName !== 'ul') return false
        if (i === 0) return true
        if ($(mSwath).get(i - 1).tagName !== 'p') return true
        if ($($(mSwath).get(i - 1)).html().match(methodReturnPattern)) return false
        return true
      })
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
          type: multitypify(match[2]),
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
          arg.properties = generateObjectProps($, $(el).find('> ul'), api)
        }
        if (arg.type === 'Function') {
          arg.parameters = generateObjectProps($, $(el).find('> ul'), api)
        }

        // Parse string sublists as ENUM values
        // e.g. apis.WebContents.instanceMethods.savePage.parameters.saveType.possibleValues
        if (arg.type === 'String') {
          arg.possibleValues = getPossibleValues($, el, arg.description, api)

          if (!arg.possibleValues.length) delete arg.possibleValues
        }

        return cleanDeep(arg)
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
