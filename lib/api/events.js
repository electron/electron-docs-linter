const omitEmpty = require('omit-empty')
const valueWithTypePattern = /<code>(.*)<\/code> (.*)/

module.exports = function ($) {
  const is = require('../helpers')($)

  return $('#events')
    .nextUntil('h2')
    .filter(is.h3)
    .map((i, el) => {
      var name = $(el).text().match(/Event: '(.*)'/)[1]
      var platforms = $(el).getEmphasized()
      var description = $(el).getParagraphs()

      var returns = $(el)
        .nextUntil('h2,h3')
        .filter(is.ul)
        .find('> li')
        .map((i, el) => {
          var properties = $(el).find('li').map((i, el) => {
            var p = $(el).html().match(valueWithTypePattern)
            return {
              name: p[1],
              type: p[2]
            }
          }).get()

          var parts = $(el).html()
            .split('\n')[0]
            .match(valueWithTypePattern)

          if (!parts) {
            console.error(`⛔ ✋ malformed doc for event \`${name}\`:`)
            console.error('---------------')
            console.error($(el).html())
            console.error('---------------')
            return
          }

          return {
            name: parts[1],
            type: parts[2].replace(/ - .*/, ''),
            description: (parts[2].match(/ - (.*)/) || '')[1],
            properties: properties
          }
        })
        .get()

      var event = {
        name: name,
        description: description,
        platforms: platforms,
        returns: returns
      }
      return (omitEmpty(event))
    })
    .get()
}
