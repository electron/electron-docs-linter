const omitEmpty = require('omit-empty')

module.exports = function (api) {
  var $ = api.$
  const helpers = require('../helpers')(api)

  return $('h2#instance-methods')
    .nextUntil('h2')
    .filter(helpers.h3)
    .map((i, el) => {
      var match = $(el).find('code').text().match(/.*\.(\w+)(.*)/)

      if (!match) return helpers.warn(api, $(el).html())

      var method = {
        name: match[1],
        signature: match[2],
        platforms: $(el).getPlatforms(),
        description: $(el).getDescription(),
        arguments: $(el).getArguments(api)
      }
      return omitEmpty(method)
    })
    .get()
}
