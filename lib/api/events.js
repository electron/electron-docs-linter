const omitEmpty = require('omit-empty')

module.exports = function (api) {
  var $ = api.$
  const helpers = require('../helpers')(api)

  return $('h2#events')
    .nextUntil('h2')
    .filter(helpers.h3)
    .map((i, el) => {
      var match = $(el).text().match(/Event: '(.*)'/)

      if (!match) return helpers.warn(api, $(el).html())

      var event = {
        name: match[1],
        description: $(el).getDescription(),
        platforms: $(el).getPlatforms(),
        returns: $(el).getArguments(api)
      }
      return (omitEmpty(event))
    })
    .get()
}
