module.exports = function ($) {
  const is = {
    h3: (i, el) => $(el).get(0).tagName === 'h3',
    p: (i, el) => $(el).get(0).tagName === 'p',
    ul: (i, el) => $(el).get(0).tagName === 'ul'
  }

  $.prototype.getParagraphs = function () {
    return this
      .nextUntil('h2,h3')
      .filter(is.p)
      .filter((i, el) => !$(el).text().match(/^Returns:/))
      .map((i, el) => $(el).text())
      .get()
      .join(' ')
      .replace(/\n/g, ' ')
  }

  $.prototype.getEmphasized = function () {
    return this
      .find('em')
      .map((i, el) => $(el).text())
      .get()
  }

  return is
}
