const omitEmpty = require('omit-empty')

module.exports = function (api, headingSelector) {
  var $ = api.$
  const helpers = require('../helpers')(api)

  return $(headingSelector)
    .nextUntil('h2')
    .filter(helpers.h3)
    .map((i, el) => {
      var match = $(el).find('code').text().match(/.*\.(\w+)(.*)/)

      if (!match) return api.addError('property', $(el).html())

      var property = {
        name: match[1],
        description: $(el).getDescription()
      }
      return (omitEmpty(property))
    })
    .get()
}
