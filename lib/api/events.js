const omitEmpty = require('omit-empty')

module.exports = function($, is) {
  var is = require('../element-filters')($)

  return $('#events')
    .nextUntil('h2')
    .filter(is.h3)
    .map((i,el) => {
      var name = $(el).text().match(/Event: '(.*)'/)[1]
      var platforms = $(el).find('em').map((i,el) => $(el).text()).get()
      var description = $(el)
        .nextUntil('h2,h3')
        .filter(is.p)
        .filter((i,el) => !$(el).text().match(/^Returns:/))
        .map((i,el) => $(el).html())
        .get()
        .join(' ')
        .replace(/\n/g, ' ')

      var returns = $(el)
        .nextUntil('h2,h3')
        .filter(is.ul)
        .find('> li')
        .map((i,el) => {
          var html = $(el).html()
          var parts = html
            .split('\n')[0]
            .match(/<code>(.*)<\/code> (.*)/)
          if (parts) {
            var returns = {
              name: parts[1],
              type: parts[2].replace(/ - .*/, ''),
              description: (parts[2].match(/ - (.*)/) || '')[1]
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
      return(omitEmpty(event))
    })
    .get()

}
