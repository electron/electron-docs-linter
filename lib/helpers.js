const omitEmpty = require('omit-empty')

module.exports = function ($) {
  var helpers = {
    h3: (i, el) => $(el).get(0).tagName === 'h3',
    p: (i, el) => $(el).get(0).tagName === 'p',
    ul: (i, el) => $(el).get(0).tagName === 'ul',
    warn: (doc, string) => {
      console.error('\n')
      console.error('⚠️⚠️⚠️')
      console.error(doc.filename)
      console.error(string)
      console.error('\n')
    }
  }

  $.prototype.getDescription = function () {
    return this
      .nextUntil('h2,h3')
      .filter(helpers.p)
      .filter((i, el) => !$(el).text().match(/^Returns:/))
      .map((i, el) => $(el).text())
      .get()
      .join(' ')
      .replace(/\n/g, ' ')
  }

  $.prototype.getPlatforms = function () {
    return this
      .find('em')
      .map((i, el) => $(el).text())
      .get()
  }

  $.prototype.getArguments = function () {
    const valueWithTypePattern = /<code>(.*)<\/code> ?(.*)?/

    return this
      .nextUntil('h2,h3')
      .filter(helpers.ul)
      .find('> li')
      .map((i, el) => {
        var properties = $(el).find('li').map((i, el) => {
          var p = $(el).html().match(valueWithTypePattern)

          if (!p) {
            console.error('\n\nruh roh')
            console.error($(el).html())
          }

          return {
            name: p[1],
            type: p[2]
          }
        }).get()

        var parts = $(el).html()
          // .split('\n')[0]
          .match(valueWithTypePattern)

        var arg = {
          name: parts[1],
          type: null,
          description: null,
          properties: properties
        }

        if (parts[2]) {
          arg.type = parts[2].replace(/ - .*/, '')
          arg.description = (parts[2].match(/ - (.*)/) || '')[1]
        }

        return omitEmpty(arg)
      })
      .get()
  }

  return helpers
}
