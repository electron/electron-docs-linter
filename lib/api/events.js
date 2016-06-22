const omitEmpty = require('omit-empty')

module.exports = function ($) {
  var is = require('../helpers')($)

  return $('#events')
    .nextUntil('h2')
    .filter(is.h3)
    .map((i, el) => {
      var name = $(el).text().match(/Event: '(.*)'/)[1]

      var platforms = $(el).find('em').map((i, el) => $(el).text()).get()

      var description = $(el).getParagraphs()

      var returns = $(el)
        .nextUntil('h2,h3')
        .filter(is.ul)
        .find('> li')
        .map((i, el) => {
          var html = $(el).html()
          var parts = html
            .split('\n')[0]
            .match(/<code>(.*)<\/code> (.*)/)

          var properties = $(el).find('li').map((i, el) => {
            var p = $(el).html().match(/<code>(.*)<\/code> (.*)/)
            return {
              name: p[1],
              type: p[2]
            }
          }).get()

          if (parts) {
            var returns = {
              name: parts[1],
              type: parts[2].replace(/ - .*/, ''),
              description: (parts[2].match(/ - (.*)/) || '')[1],
              properties: properties
            }
            return returns
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
