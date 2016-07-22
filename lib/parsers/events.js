const omitEmpty = require('omit-empty')

module.exports = function (api, headingSelector) {
  var $ = api.$
  const helpers = require('../helpers')(api)
  const pattern = /Event: '(.*)'/

  return $(headingSelector)
    .nextUntil('h2,h3')
    .filter(helpers.h3orh4)
    .map((i, el) => {
      var match = $(el).text().match(pattern)

      if (!match) return api.addError('event', pattern, $(el).html())

      var event = {
        name: match[1],
        description: $(el).getDescription(),
        platforms: $(el).getPlatforms(),
        returns: $(el).getArguments(api, 'event')
      }
      return (omitEmpty(event))
    })
    .get()
}
