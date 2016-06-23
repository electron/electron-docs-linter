const omitEmpty = require('omit-empty')

module.exports = function (api) {
  var $ = api.$

  var helpers = {
    h3: (i, el) => $(el).get(0).tagName === 'h3',
    p: (i, el) => $(el).get(0).tagName === 'p',
    ul: (i, el) => $(el).get(0).tagName === 'ul',
    warn: (doc, string) => {
      console.error('\n')
      console.error('⚠️ ⚠️ ⚠️')
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

  $.prototype.getArguments = function (api) {
    // const pattern = /<code>(.*)<\/code> ?(.*)?/
    const pattern = /<code>(\w+)<\/code>\s*(?:<a href.*>)?(\w+)(?:<\/a>)?(?: - )?(.*)$/

    return this
      .nextUntil('h2,h3')
      .filter(helpers.ul)
      .find('> li')
      .map((i, el) => {
        var properties
        // var properties = $(el)
        //   .find('li')
        //   .map((i, el) => {
        //     // console.error('\n\n\n')
        //     // console.error($(el).html())
        //     var match = $(el).html().match(pattern)
        //     if (!match) return helpers.warn(api.doc, $(el).html())
        //     return {
        //       name: match[1],
        //       type: match[2]
        //     }
        //   })
        //   .get()

        var match = $(el).html()
          .split('\n')[0]
          .match(pattern)

        if (match) {
          var arg = {
            name: match[1],
            type: match[2],
            description: match[3],
            properties: properties
          }
          return omitEmpty(arg)
        }
      })
      .get()
  }
  return helpers
}
