const omitEmpty = require('omit-empty')
const cheerio = require('cheerio')

module.exports = function (api) {
  var $ = api.$

  var helpers = {
    h3: (i, el) => $(el).get(0).tagName === 'h3',
    h3orh4: (i, el) => ['h3', 'h4'].includes($(el).get(0).tagName),
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

  $.prototype.getArguments = function (api) {
    const pattern = /<code>(\w+)<\/code>\s*(?:<a href.*>)?(\w+)(?:<\/a>)?(?: - )?(.*)$/

    return this
      .nextUntil('h2,h3')
      .filter(helpers.ul)
      .find('> li')
      .map((i, el) => {
        var match = $(el).html()
          .split('\n')[0]
          .match(pattern)

        if (!match) return api.addError('arguments', $(el).html())

        var description = match[3].replace(/<\/?code>/g, '`')
        description = cheerio.load(`<article>${description}</article>`)('article').text()

        var arg = {
          name: match[1],
          type: match[2],
          description: description
        }

        arg.properties = $(el)
          .find('li')
          .map((i, el) => {
            var match = $(el).html().match(pattern)
            if (!match) return api.addError('argument subproperties', $(el).html())
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
