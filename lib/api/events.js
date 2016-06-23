const omitEmpty = require('omit-empty')

module.exports = function ($, doc) {
  const helpers = require('../helpers')($)

  return $('h2#events')
    .nextUntil('h2')
    .filter(helpers.h3)
    .map((i, el) => {
      var match = $(el).text().match(/Event: '(.*)'/)

      if (!match) return helpers.warn(doc, $(el).html())

      var event = {
        name: match[1],
        description: $(el).getDescription(),
        platforms: $(el).getPlatforms(),
        returns: $(el).getArguments()
      }
      return (omitEmpty(event))
    })
    .get()
}
