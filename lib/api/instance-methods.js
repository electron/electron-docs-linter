const omitEmpty = require('omit-empty')

module.exports = function ($) {
  const is = require('../helpers')($)

  return $('#instance-methods')
    .nextUntil('h2')
    .filter(is.h3)
    .map((i, el) => {
      var parts = $(el).find('code').text().match(/.*\.(\w+)(.*)/)
      var method = {
        name: parts[1],
        signature: parts[2]
      }
      return omitEmpty(method)
    })
    .get()
}
