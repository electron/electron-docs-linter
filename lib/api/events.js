const omitEmpty = require('omit-empty')

module.exports = function ($) {
  const is = require('../helpers')($)

  return $('#events')
    .nextUntil('h2')
    .filter(is.h3)
    .map((i, el) => {
      var name = $(el).text().match(/Event: '(.*)'/)[1]
      var platforms = $(el).getPlatforms()
      var description = $(el).getDescription()
      var returns = $(el).getArguments()

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
