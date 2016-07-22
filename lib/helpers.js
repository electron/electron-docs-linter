const omitEmpty = require('omit-empty')
const cheerio = require('cheerio')

module.exports = function (api) {
  var $ = api.$

  var helpers = {
    h3: (i, el) => $(el).get(0).tagName === 'h3',
    h4: (i, el) => $(el).get(0).tagName === 'h4',
    p: (i, el) => $(el).get(0).tagName === 'p',
    ul: (i, el) => $(el).get(0).tagName === 'ul'
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

  $.prototype.getArguments = function (api, type) {
    const pattern = /<code>(\w+)<\/code>\s*(?:<a href.*>)?([a-zA-Z0-9\[\]]+)(?:<\/a>)?(?: - )?(.*)/

    return this
      .nextUntil('h2,h3')
      .filter(helpers.ul)
      .find('> li')
      .map((i, el) => {
        var match = $(el).html()
          .split('\n')[0]
          .match(pattern)

        // Parsing error
        if (!match) return api.addError('arguments', pattern, $(el).html())

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
        if (type !== 'event') {
          arg.required = !$(el).text().match('(optional)')
        }

        arg.properties = $(el)
          .find('li')
          .map((i, el) => {
            var match = $(el).html().match(pattern)
            if (!match) return api.addError('argument subproperties', pattern, $(el).html())
            return {
              name: match[1],
              type: match[2],
              description: match[3]
            }
          })
          .get()

        return omitEmpty(arg)
      })
      .get()
  }
  return helpers
}
