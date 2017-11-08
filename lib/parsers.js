'use strict'

const cheerio = require('cheerio')
const cleanDeep = require('clean-deep')
const entities = require('entities')

const parameterPattern = /<code>((?:...)?\w+?)<\/code>\s*(\(?(?:(?:(?:<a href.*?>)?[a-zA-Z0-9[\]]+(?:<\/a>)?(?: \| )?)+)\)?(?:\[])?)(?: - )?([\s\S]*)/m
const methodReturnPattern = /^Returns (<a.+?>)?<code>(.*?)<\/code>(<\/a>)?/g
const multiTypePattern = /(?:<a href.*?>)?([a-zA-Z0-9[\]]+)(?:<\/a>)?(?: \| )?/mg

const stripArrTags = (type) => {
  if (Array.isArray(type)) {
    return type.map(typeName => ({
      typeName: stripArrTags(typeName),
      collection: typeName.endsWith('[]') || (typeof multitypify(typeName) === 'string' && multitypify(typeName).endsWith('[]'))
    }))
  } else {
    return type.endsWith('[]') ? type.substr(0, type.length - 2) : type
  }
}
const multitypify = (fullTypeString) => {
  let typeString = fullTypeString
  if (typeString.startsWith('(') && typeString.endsWith(')')) {
    typeString = typeString.substr(1, typeString.length - 2)
  }
  if (typeString.startsWith('(') && typeString.endsWith(')[]')) {
    typeString = typeString.substr(1, typeString.length - 4)
  }
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
  if (!description) return ''
  return entities.decodeHTML(description
    .replace(/ - /gi, ' ') // remove spaced dashes
    .replace(/\n/g, ' ') // newlines to spaces
    .replace(/\s+/g, ' ') // remove extra spaces
    .replace(/^\s*\(optional\)/gi, '') // remove (optional) notation, because it is parsed as a boolean
    .trim()
  )
}
const preserveBackTicks = (str) => str.replace(/<\/?code>/g, '`')
const getPossibleValues = ($, el, description, api) => {
  const enumPattern = /<code>([-\w]+)<\/code>\s*(?:- ([\s\S]*))?/
  let possibleValues = $(el)
    .find('li')
    .map((i, el) => {
      var match = $(el).html().match(enumPattern)
      if (!match) {
        console.error('Problem parsing parameter ENUM values:')
        console.error($(el).html())
        return
      }
      return {
        value: match[1],
        description: sanitizeDescription(match[2])
      }
    })
    .get()
  if (possibleValues.length) return possibleValues
  if (!description) return []

  const inlineValuesPattern = /(?:can be|values include) ((?:(?:`[a-zA-Z-]+`)(?:, ))*(?:`[a-zA-Z-]+`)?(?: (?:or|and) `[a-zA-Z-]+`)?)/i
  const inlineMatch = inlineValuesPattern.exec(description)
  if (inlineMatch) {
    const valueString = inlineMatch[1]
    const valuePattern = /`([a-zA-Z-]+)`/g
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
      if (!match) {
        console.error('parameter subproperties')
        console.error(`parameterPattern: ${parameterPattern}`)
        console.error(`el: ${el}`)
        return
      }
      let parameters
      let properties
      let possibleValues
      let description = match[3]

      // Convert any lingering HTML to text
      description = cheerio.load(`<foo>${description}</foo>`)('foo')
        .contents()
        .filter(function () { return this.type === 'text' || (this.type === 'tag' && this.name === 'code') }) // avoid nested ULs
        .text()

      const ret = {
        name: match[1],
        type: stripArrTags(multitypify(match[2])),
        collection: match[2].endsWith('[]') || (typeof multitypify(match[2]) === 'string' && multitypify(match[2]).endsWith('[]')),
        description: sanitizeDescription(description),
        required: !description.match(/\(optional\)/i)
      }

      const retTypes = Array.isArray(ret.type) ? ret.type : [{ typeName: ret.type }]

      retTypes.forEach((retType) => {
        if (retType.typeName === 'Object') {
          properties = []
          const innerProps = $(el).find('> ul')
          if (innerProps.length === 1) {
            properties = generateObjectProps($, innerProps, api)
          }
        }
        if (retType.typeName === 'Function') {
          parameters = []
          const innerParams = $(el).find('> ul')
          if (innerParams.length === 1) {
            parameters = generateObjectProps($, innerParams, api, true)
          }
        }
        if (retType.typeName === 'String') {
          possibleValues = getPossibleValues($, el, sanitizeDescription(preserveBackTicks($(el).html())), api)
          if (!possibleValues.length) possibleValues = null
        }
      })

      if (properties) ret.properties = properties
      if (parameters) ret.parameters = parameters
      if (possibleValues) ret.possibleValues = possibleValues
      return ret
    })
    .get()
}

module.exports = {
  stripArrTags,
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
    description = sanitizeDescription(description)
    // Parse string sublists as ENUM values
    // e.g. apis.WebContents.instanceMethods.savePage.parameters.saveType.possibleValues
    let possibleValues = []
    if (type === 'String') {
      possibleValues = getPossibleValues($, returnPara, sanitizeDescription(preserveBackTicks($(returnPara).html())), api)
    }
    const ret = {
      type: stripArrTags(multitypify(type)),
      collection: type.endsWith('[]') || (typeof multitypify(type) === 'string' && multitypify(type).endsWith('[]')),
      description,
      properties,
      possibleValues
    }
    if (!possibleValues.length) delete ret.possibleValues
    return ret
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

        // Parsing error
        if (!match) {
          console.error('problem parsing parameters')
          console.error(`parameterPattern: ${parameterPattern}`)
          console.error(`el: ${el}`)
          return
        }

        // Preserve backticks
        var description = preserveBackTicks(match[3])

        // Convert any lingering HTML to text
        description = cheerio.load(`<foo>${description}</foo>`)('foo')
          .contents()
          .filter(function () { return this.type === 'text' }) // avoid nested ULs
          .text()

        var arg = {
          name: match[1],
          type: stripArrTags(multitypify(match[2])),
          collection: match[2].endsWith('[]') || (typeof multitypify(match[2]) === 'string' && multitypify(match[2]).endsWith('[]')),
          description: sanitizeDescription(description),
          required: !description.match(/\(optional\)/i)
        }

        const argTypes = Array.isArray(arg.type) ? arg.type : [{ typeName: arg.type }]

        argTypes.forEach((argType) => {
          if (argType.typeName === 'Object') {
            // Parse parameters that have complex objects defined in sublists
            arg.properties = generateObjectProps($, $(el).find('> ul'), api)
          }

          if (argType.typeName === 'Function') {
            arg.parameters = generateObjectProps($, $(el).find('> ul'), api)
          }

          // Parse string sublists as ENUM values
          // e.g. apis.WebContents.instanceMethods.savePage.parameters.saveType.possibleValues
          if (argType.typeName === 'String') {
            arg.possibleValues = getPossibleValues($, el, arg.description, api)

            if (!arg.possibleValues.length) delete arg.possibleValues
          }
        })

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
